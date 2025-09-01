
const express = require('express');
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser');
const app = express();
const DB = require('./database')
const oracledb = require('oracledb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
app.use(express.static(path.join(__dirname, 'client/build')));
// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
const port = 3000;
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, 'public', 'images');

     
      fs.mkdirSync(uploadDir, { recursive: true });

      cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('frontpage');
});
app.get('/home', (req, res) => {
  res.render('home');
});
app.get('/addproduct', (req, res) => {
  res.render('addproduct');
});


app.get('/signup/customer', (req, res) => {
    res.render('signupCustomer');
  });
  // app.post('/signup/customer',async (req, res) => {
  //   let{}
  // })
  app.post('/signup/customer',async (req, res) =>{
    const { email , password , confirmpassword , name , phoneNumber , birthday , gender,
      division,
      district,
      upazila,
      thana,
      zipcode,
      roadNo,
      houseNo   } = req.body
     // console.log(email);
    if(email)
    {
      let sql ='SELECT COUNT(*) FROM PERSON P JOIN CUSTOMERS C ON P."User ID" = C.USER_ID WHERE P."Email"=:1'
      let result = await DB(sql, [email], false);
      console.log(result.rows[0]['COUNT(*)']);
      if(result.rows[0]['COUNT(*)'] != 0)
      {
          return  res.json({ 'alert': `email already exist` })  ;
      }
    }
    if(password.length < 8)
    {
     return  res.json({'alert' : 'password is weak password'});
    }
  //console.log(confirmpassword);
    if(password != confirmpassword)
    {
     return  res.json({'alert' : 'Password didnt match'});
    }
    if(birthday > Date() ){
      return  res.json({'alert' : 'birthday is not valid'});
    }
    if(phoneNumber.length != 11)
    { return res.json({'alert':'phone Number is not valid'})}
    if(isNaN(Number(zipcode)) || isNaN(Number(houseNo))|| isNaN(Number(roadNo)) )
    {
      return res.json('zipcode , house and roadno must be numeric');
    }

    let sql = `INSERT INTO person ( "Email", "Password", "Name", "Phone number", "BirthDay", "Gender","Division", "District", "Upazila", "Thana", "Zipcode","Road no.","House no.") VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10,:11,:12,:13 )`
    const bindParams = {
      email,
      password,
      name,
      phoneNumber,
      birthday,
      gender,
      division,
      district,
      upazila,
      thana,
      zipcode,
      roadNo,
      houseNo
      
    };
    let birthdayDate = new Date(birthday);
    let result = await DB(sql , [email , password , name , phoneNumber ,  birthdayDate , gender , division , district , upazila , thana , zipcode,roadNo,houseNo ], true )
    let result1 = await DB(`select * from PERSON WHERE "Email" like :1 `,[email],false);
    console.log(result1.rows[0]['User ID']);
     await DB(`INSERT INTO CUSTOMERS (USER_ID) VALUES(:1)`,[result1.rows[0]['User ID']],true);
   // await DB('COMMIT', [], true);
   // console.log(result);
     return res.redirect('/login/customer')
    
  })

  
  //login customer 
  var flag = false  ;
app.get('/login/customer', async(req, res) => {
  var isvalid
   if(flag == false )
   {
    isvalid = 0;
   }
   else {
    isvalid = 1; 
   }
    res.render('loginCustomer',{isvalid});
});
app.post('/login/customer',async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  if (!email || !password) {
      return res.json({ 'alert': 'Fill all the inputs' })
  }

  let sql = `SELECT COUNT(*) FROM PERSON P JOIN CUSTOMERS C ON P."User ID" = C.USER_ID WHERE P."Email"=:1`
  let result = await DB(sql, [email], false)
  //console.log(result.rows[0])
  if (result.rows[0]['COUNT(*)'] == 0) {
      return res.json({ 'alert': `email doesn't exist` });
  } else {
      sql = `SELECT * FROM PERSON P JOIN CUSTOMERS C ON P."User ID" =  C.USER_ID WHERE P."Email" =:1`
      result = await DB(sql, [email], false)
      //console.log(result);
      if (result.rows[0]['Password']=== password) {
         return res.redirect(`/customerhome?userid=${result.rows[0]['USER_ID']}`)
      } else {
           flag = true ;
          return res.redirect(`/login/customer`)
      }
  }
})
app.get('/signup/seller', (req, res) => {
    res.render('signupSeller');
  });
app.post('/signup/seller',async (req, res) => {
  const {businessType,businessName, email , password , confirmpassword , name , phoneNumber , nid ,birthday , gender,
    division,
    district,
    upazila,
    thana,
    zipcode,
    roadNo,
    houseNo   } = req.body
   // console.log(email);
  if(email)
  {
    let sql ='SELECT COUNT(*) FROM PERSON P JOIN SELLERS S ON P."User ID" = S.USER_ID WHERE P."Email"=:1'
    let result = await DB(sql, [email], false);
    console.log(result.rows[0]['COUNT(*)']);
    if(result.rows[0]['COUNT(*)'] != 0)
    {
        return  res.json({ 'alert': `email already exist` })  ;
    }
  }
  if(password.length < 8)
  {
   return  res.json({'alert' : 'password is weak password'});
  }
//console.log(confirmpassword);
  if(password != confirmpassword)
  {
   return  res.json({'alert' : 'Password didnt match'});
  }
  if(birthday > Date() ){
    return  res.json({'alert' : 'birthday is not valid'});
  }
  if(nid.length != 13  ){
    return  res.json({'alert' : 'nid is not valid'});
  }
  if(phoneNumber.length != 11)
  { return res.json({'alert':'phone Number is not valid'})}
  if(isNaN(Number(zipcode)) || isNaN(Number(houseNo))|| isNaN(Number(roadNo)) )
  {
    return res.json('zipcode , house and roadno must be numeric');
  }

  let sql = `INSERT INTO person ("Email", "Password", "Name", "Phone number", "BirthDay", "Gender","Division", "District", "Upazila", "Thana", "Zipcode","Road no.","House no.") VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10,:11,:12,:13 )`
  const bindParams = {
    email,
    password,
    name,
    phoneNumber,
    birthday,
    gender,
    division,
    district,
    upazila,
    thana,
    zipcode,
    roadNo,
    houseNo
    
  };
  let birthdayDate = new Date(birthday);
  let result = await DB(sql , [email , password , name , phoneNumber ,  birthdayDate , gender , division , district , upazila , thana , zipcode,roadNo,houseNo ], true )
  let result1 = await DB(`select * from PERSON WHERE "Email" like :1 `,[email],false);
  console.log(result1.rows[0]['User ID']);
   await DB(`INSERT INTO SELLERS(USER_ID,NID,TYPES,BUSINESS_NAME)  VALUES(:1,:2,:3,:4)`,[result1.rows[0]['User ID'],nid,businessType,businessName],true);
 // await DB('COMMIT', [], true);
 // console.log(result);
   return res.redirect('/login/seller')
})
app.get('/login/seller', (req, res) => {
    res.render('loginSeller');
});
app.post('/login/seller',async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
      return res.json({ 'alert': 'Fill all the inputs' })
  }

  let sql = `SELECT COUNT(*) FROM PERSON P JOIN SELLERS S ON P."User ID" = S.USER_ID WHERE P."Email"=:1`
  let result = await DB(sql, [email], false)
  //console.log(result.rows[0])
  if (result.rows[0]['COUNT(*)'] == 0) {
      return res.json({ 'alert': `email doesn't exist` });
  } else {
      sql = `SELECT * FROM PERSON P JOIN SELLERS S ON P."User ID" =  S.USER_ID WHERE P."Email" =:1`
      result = await DB(sql, [email], false)
      //console.log(result);
      if (result.rows[0]['Password']=== password) {
         let sellerid=result.rows[0]['SELLER_ID']
         return res.redirect(`/sellerhome?sellerid=${sellerid}`)
      } else {
          return res.json({ 'alert': 'password is incorrect' })
      }
  }
})
// Define routes here...


// Endpoint to fetch products
app.get('/customerhome', async(req, res) => {
  const {userid } = req.query;
  sql = `SELECT * FROM CUSTOMERS C JOIN PERSON S ON C.USER_ID = S."User ID" WHERE USER_ID = :1`;
      result = await DB(sql, [userid], false)
    res.render('customerhome',result);  // Assuming you have a 'customerhome' template
  })
app.post('/customerhome', async (req, res) => {
    try {
      const { searchQuery } = req.body;
  
      const connection = await oracleDB.getConnection(dbConfig);
      
      const result = await connection.execute(
        `SELECT * FROM product WHERE name LIKE :searchQuery`,
        { searchQuery: `%${searchQuery}%` },
        { outFormat: oracleDB.OUT_FORMAT_OBJECT }
      );

      console.log(result.rows);
      res.json(result.rows);
  
      // Release the connection back to the pool
      await connection.close();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/sellerhome',async(req,res)=>{
    try {
      let { sellerid } = req.query;
      console.log(sellerid);
    
      let sql = 'SELECT * FROM  PRODUCT  WHERE SELLER_ID = :1';
      let results = await DB(sql, [sellerid], false);
    
      console.log(results.rows); // Log the results array
      //const sellerid = results.rows[0]['SELLER_ID']
      res.render('sellerhome', {  results,sellerid });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
    })
    
 console.log('bal er jbfnj');
 console.log('l er dvijbfnj');
     
    
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}); 
