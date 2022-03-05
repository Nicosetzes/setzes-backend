export class ContenedorMongo {
  constructor(schema) {
    this.schema = schema;
    this.object = [];
  }
  getAll() {
    this.schema.find({})
      .then(products => console.log(products))
      .then(data => this.object = data)
      .catch(err => console.log(err));
    // if (this.object.length === 0) {
    //   throw new Error(`There are no products in catalogue`);
    // } else {
    //   return this.object;
    // }
  }
  getById(id) {
    this.schema.find({ id })
      // .then(products => console.log(products))
      .then(data => this.object = data)
      .catch(err => console.log(err));
    // if (this.object.length === 0) {
    //   throw new Error(`ID not found`);
    // } else {
    //   return this.object;
    // }
  }
  deleteById(id) {
    this.schema.deleteOne({ id })
      .then(() => console.log(`The register with ID: ${id} has been deleted`))
      .catch(err => console.log(err))
  }
  deleteAll() {
    this.schema.deleteMany({})
      .then(() => console.log('All registers have been deleted'))
      .catch(err => console.log(err))
  }
  saveOne(obj) {
    this.schema.insertOne(obj) // NO FUNCIONA EL MÉTODO INSERTONE, SOLO ME FUNCIONA EL INSERTMANY CON UN ARRAY (DE 1 OBJETO O MÁS)
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }
  saveMany(array) {
    const cleanArray = array.map(element => new this.schema(element)); // Aplico el schema sobre los productos a agregar en el array
    // if (!cleanArray) {
    //   throw new Error(`No objects have been `);
    // }
    this.schema.insertMany(cleanArray)
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }
  updateById(id, object) {
    this.schema.updateOne({ id }, {
      $set: object
    })
      .then(data => console.log(data))
      .catch(err => console.log(err))
  }
}
