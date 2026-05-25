const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../.data');

// Create storage directory if not exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class MockQuery {
  constructor(data, modelInstance) {
    this.data = JSON.parse(JSON.stringify(data)); // Deep clone
    this.modelInstance = modelInstance;
  }

  sort(sortObj) {
    if (!sortObj) return this;
    const key = Object.keys(sortObj)[0];
    const dir = sortObj[key];
    this.data.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;
      if (typeof valA === 'string') {
        return dir === -1 ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      return dir === -1 ? valB - valA : valA - valB;
    });
    return this;
  }

  populate(field) {
    if (!field) return this;
    const users = new MockModel('users')._read();
    const courses = new MockModel('courses')._read();

    this.data.forEach(item => {
      if (field === 'instructor' && item.instructor) {
        const instId = typeof item.instructor === 'object' ? item.instructor._id : item.instructor;
        const matched = users.find(u => u._id === instId);
        if (matched) {
          const { password, ...userWithoutPassword } = matched;
          item.instructor = userWithoutPassword;
        }
      }
      if (field === 'student' && item.student) {
        const studId = typeof item.student === 'object' ? item.student._id : item.student;
        const matched = users.find(u => u._id === studId);
        if (matched) {
          const { password, ...userWithoutPassword } = matched;
          item.student = userWithoutPassword;
        }
      }
      if (field === 'course' && item.course) {
        const courseId = typeof item.course === 'object' ? item.course._id : item.course;
        const matchedCourse = courses.find(c => c._id === courseId);
        if (matchedCourse) {
          // deep clone the course first
          const populatedCourse = JSON.parse(JSON.stringify(matchedCourse));
          // also populate instructor in course
          if (populatedCourse.instructor) {
            const instId = typeof populatedCourse.instructor === 'object' ? populatedCourse.instructor._id : populatedCourse.instructor;
            const matchedInst = users.find(u => u._id === instId);
            if (matchedInst) {
              const { password, ...instWithoutPw } = matchedInst;
              populatedCourse.instructor = instWithoutPw;
            }
          }
          item.course = populatedCourse;
        }
      }
    });
    return this;
  }

  select(fieldsString) {
    if (!fieldsString) return this;
    const fields = fieldsString.split(' ');
    const exclude = fields.some(f => f.startsWith('-'));

    this.data = this.data.map(item => {
      const newItem = { ...item };
      if (exclude) {
        fields.forEach(f => {
          const cleanF = f.replace('-', '');
          delete newItem[cleanF];
        });
      } else {
        const temp = {};
        fields.forEach(f => {
          if (item[f] !== undefined) temp[f] = item[f];
        });
        return temp;
      }
      return newItem;
    });
    return this;
  }

  skip(num) {
    this.data = this.data.slice(num);
    return this;
  }

  limit(num) {
    this.data = this.data.slice(0, num);
    return this;
  }

  // Enable direct async/await resolution
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.data).then(onfulfilled, onrejected);
  }
}

class MockModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  _read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  _matches(item, query) {
    for (const key in query) {
      if (query[key] && typeof query[key] === 'object' && !Array.isArray(query[key])) {
        // Handle MongoDB operators (like $or, $in, $ne)
        if (key === '$or' && Array.isArray(query[key])) {
          return query[key].some(q => this._matches(item, q));
        }
        // Handle sub-operators inside keys (e.g. { role: { $ne: 'admin' } })
        const opKey = Object.keys(query[key])[0];
        const opVal = query[key][opKey];
        if (opKey === '$ne' && item[key] === opVal) return false;
        if (opKey === '$in' && Array.isArray(opVal) && !opVal.includes(item[key])) return false;
        if (opKey === '$nin' && Array.isArray(opVal) && opVal.includes(item[key])) return false;
      } else {
        if (item[key] !== query[key]) return false;
      }
    }
    return true;
  }

  find(query = {}) {
    const list = this._read();
    const filtered = list.filter(item => this._matches(item, query));
    return new MockQuery(filtered, this);
  }

  findOne(query = {}) {
    const list = this._read();
    const matched = list.find(item => this._matches(item, query));
    return matched ? JSON.parse(JSON.stringify(matched)) : null;
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  create(data) {
    const list = this._read();
    
    // Auto-generate subdocument _ids for array fields (like lessons in courses)
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach((subdoc, idx) => {
          if (subdoc && typeof subdoc === 'object' && !subdoc._id) {
            subdoc._id = 'sub_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7);
          }
        });
      }
    }

    const newRecord = {
      _id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newRecord);
    this._write(list);
    return Promise.resolve(JSON.parse(JSON.stringify(newRecord)));
  }

  findByIdAndUpdate(id, updateData, options = {}) {
    const list = this._read();
    const index = list.findIndex(item => item._id === id);
    if (index === -1) return Promise.resolve(null);

    const updated = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    list[index] = updated;
    this._write(list);
    return Promise.resolve(JSON.parse(JSON.stringify(updated)));
  }

  findOneAndUpdate(query, updateData, options = {}) {
    const list = this._read();
    const index = list.findIndex(item => this._matches(item, query));
    if (index === -1) return Promise.resolve(null);

    const updated = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    list[index] = updated;
    this._write(list);
    return Promise.resolve(JSON.parse(JSON.stringify(updated)));
  }

  deleteOne(query = {}) {
    const list = this._read();
    const index = list.findIndex(item => this._matches(item, query));
    if (index === -1) return Promise.resolve({ deletedCount: 0 });

    list.splice(index, 1);
    this._write(list);
    return Promise.resolve({ deletedCount: 1 });
  }

  deleteMany(query = {}) {
    const list = this._read();
    const remaining = list.filter(item => !this._matches(item, query));
    const deletedCount = list.length - remaining.length;
    this._write(remaining);
    return Promise.resolve({ deletedCount });
  }

  countDocuments(query = {}) {
    const list = this._read();
    const count = list.filter(item => this._matches(item, query)).length;
    return Promise.resolve(count);
  }
}

module.exports = MockModel;
