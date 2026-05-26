import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null
    },
    status:{
        type:String,
        enum:['pending', 'resolved', 'in-progress'],
        default:'pending'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
});

const queryModel = mongoose.model("Query", querySchema);

export default queryModel;