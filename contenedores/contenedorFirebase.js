export class ContenedorFirebase {
  constructor(admin, collection) {
    this.admin = admin;
    this.collection = collection;
    this.object = [];
  }
  getAll() {
    const db = this.admin.firestore();
    const query = db.collection(this.collection);
    const querySnapshot = query.get()
      .then(data => {
        let docs = data.docs;
        return docs;
      })
      .then(docs => {
        const response = docs.map(doc => ({
          id: doc.id,
          productTimestamp: doc.data().productTimestamp,
          name: doc.data().name,
          description: doc.data().description,
          code: doc.data().code,
          url: doc.data().url,
          price: doc.data().price,
          stock: doc.data().stock
        }));
        console.log(response)
      })
      .catch(err => console.log(err))
  }
  getById(id) {
    const db = admin.firestore();
    const query = db.collection("products");
    const doc = query.doc(`${id}`);
    const item = doc.get()
      .then(data => {
        const response = data.data();
        console.log(response);
      })
      .catch(err => console.log(err))
  }
  deleteById(id) {
    const db = this.admin.firestore();
    const query = db.collection(this.collection);

    const doc = query.doc(`${id}`);
    const item = doc.delete()
      .then(data => console.log("El usuario ha sido eliminado", data))
      .catch(err => console.log(err));
  }
  // deleteAll() {
  //  Quizás podría hacer algo con batch de Firebase, debería chequear //
  // }
  saveOne(obj) {
    const db = this.admin.firestore();
    const query = db.collection(this.collection);
    const doc = query.doc();
    doc.create(obj)
      .then(data => console.log(data))
      .then(() => console.log("A register has been saved"))
      .catch(err => console.log(err))
  }
  saveMany(array) {
    const db = this.admin.firestore();
    const query = db.collection(this.collection);
    array.forEach((object) => {
      let doc = query.doc();
      doc.create(object)
        .then(data => console.log(data))
        .then(() => console.log("A register has been saved"))
        .catch(err => console.log(err))
    })
  }
  updateById(id, object) {
    const db = this.admin.firestore();
    const query = db.collection(this.collection);
    const doc = query.doc(`${id}`);
    let item = doc.update(object)
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }
}