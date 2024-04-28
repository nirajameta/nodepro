const connectDB = require('./db');

const app = require('./app')

connectDB().then(() => {
    console.log(process.env.PORT)
    app.listen(process.env.PORT || 8000, function(err){
        if(err) return
        console.log(`Server listening on Port", ${process.env.PORT}`);

    })
        console.log('connected to db');
}).catch(err => {
    console.log('There are some errors while connecting to database', err)
});
