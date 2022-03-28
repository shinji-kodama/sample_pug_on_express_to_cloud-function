const functions = require("firebase-functions");
const {
  initializeApp,
  // applicationDefault,
  // cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  // Timestamp,
  // FieldValue,
} = require("firebase-admin/firestore");

const express = require("express");
const cors = require("cors");

initializeApp();
const db = getFirestore();

const app = express();

// jsonデータを扱う
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// jsファイル等の読み込み
app.use("/public", express.static(__dirname + "/public"));

// corsの許可
app.use(cors());
app.set("view engine", "pug");

app.get("/test", async (req, res) => {
  const lineId = req.query.line_id;
  const idHash = req.query.contract_id_hash;

  const companyData = await getFireCompany(idHash);
  console.log("companyData: ", companyData);
  const customerData = await getFireCustomer(companyData.contractId, lineId);
  console.log("customerData: ", customerData);

  const anniversaries =
    await getFireAnniversaries(companyData.contractId, customerData.customerId);
  console.log(anniversaries);

  res.render("index", {
    title: "get",
    contractId: companyData.contractId,
    lineId: lineId,
    customerId: customerData.customerId,
    customerName: customerData.lineName,
    anniversaries: anniversaries,
  });
});


app.post("/test", async (req, res) => {
  const data = req.body;
  await addFireAniversary(data);

  const anniversaries =
    await getFireAnniversaries(data.contractId, data.customerId);

  res.render("index", {
    title: "post",
    contractId: data.contractId,
    lineId: data.lineId,
    customerId: data.customerId,
    customerName: data.lineName,
    anniversaries: anniversaries,
  });
});

const getFireCompany = async (idHash) => {
  const snapshot = await db
      .collection("company")
      .where("contractIdHash", "==", idHash)
      .get()
      .catch((e) => {
        functions.logger.log("getCompanyByFieldValue error: ", e);
        throw new Error(e);
      });

  if (snapshot.empty) {
    functions.logger.log("getFireCompany : ", "documentがない");
    return null;
  }

  return snapshot
      .docs
      .map((doc) => Object.assign( {contractId: doc.id}, doc.data()))[0];
};

const getFireCustomer = async (contractId, lineId) => {
  const colName = "company";
  const subColName = "customers";

  console.log("contract id: ", contractId);
  console.log("line id: ", lineId);

  const snapshot = await db
      .collection(colName)
      .doc(contractId)
      .collection(subColName)
      .where("lineID", "==", lineId)
      .get()
      .catch((e) => {
        functions.logger.log("getFireAnniversary error: ", e);
        throw new Error(e);
      });

  console.log("snapshot: ", snapshot.docs);

  if (snapshot.empty) {
    functions.logger.log("getFireAnniversary : ", "documentがない");
    return null;
  }

  return snapshot.docs.map((doc) => Object.assign({id: doc.id}, doc.data()))[0];
};

const getFireAnniversaries = async (contractId, customerId) => {
  const colName = "company";
  const subColName = "customers";
  const subSubColName = "anniversaries";
  console.log(contractId, customerId);

  try {
    const snapshot = await db
        .collection(colName)
        .doc(contractId)
        .collection(subColName)
        .doc(customerId)
        .collection(subSubColName)
        .get();

    return snapshot
        .docs
        .map((doc) => Object.assign( {contractId: doc.id}, doc.data()));
  } catch (e) {
    functions.logger.log("getFireAnniversaries error: ", e);
    return [];
  }
};


const addFireAniversary = async (data) => {
  const colName = "company";
  const subColName = "customers";
  const subSubColName = "anniversaries";

  await db
      .collection(colName)
      .doc(data.contractId)
      .collection(subColName)
      .doc(data.customerId)
      .collection(subSubColName)
      .add(data)
      .catch((e) => {
        functions.logger.log("addAniversary error: ", e);
        throw new Error(e);
      });
};

const anniversaryApi = functions.https.onRequest(app);
module.exports = {anniversaryApi};
