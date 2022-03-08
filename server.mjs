import express from "express";
import cors from "cors";
import dialogflow from '@google-cloud/dialogflow';
import gcHelper from "google-credentials-helper"
import { WebhookClient, Card, Suggestion, Image, Payload } from 'dialogflow-fulfillment';
import mongoose from 'mongoose'
mongoose.connect("mongodb+srv://haseeb:haseeb@cluster0.rdqa1.mongodb.net/chatbot?retryWrites=true&w=majority")
gcHelper();
const sessionClient = new dialogflow.SessionsClient()

const app = express();
app.use(cors())
app.use(express.json())


const PORT = process.env.PORT || 7001;

app.post("/api/df_text_query", async (req, res) => {
const projectId = "pc-shopping-nrih"
const sessionId = req.body.sessionId || "session123"
const text = req.body.text;
const languageCode = "en-US"
const event = req.body.event


    console.log("query: ", query, req.body);

    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: text,
                languageCode: languageCode,
            },
        },
    };
    try {
        const responses = await sessionClient.detectIntent(request);
        // console.log("responses: ", responses);
        // console.log("resp: ", responses[0].queryResult.fulfillmentText);    
        res.send(
             responses[0].queryResult
        );

    } catch (e) {
        console.log("error while detecting intent: ", e)
    }
})
app.post("/api/df_event_query", async (req, res) => {

const projectId = "pc-shopping-nrih"
const sessionId = req.body.sessionId || "session123"
const query = req.body.text;
const languageCode = "en-US"
const event = req.body.event

    console.log("query: ", event, req.body);

    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            event: {
                // The query to send to the dialogflow agent
                name: event,
                // The language used by the client (en-US)
                languageCode: languageCode,
              },
        },
    };
    try {
        const responses = await sessionClient.detectIntent(request);
        // console.log("responses: ", responses);
        // console.log("resp: ", responses[0].queryResult.fulfillmentText);    
        res.send(
            responses[0].queryResult
        );

    } catch (e) {
        console.log("error while detecting intent: ", e)
    }
})



        const OrderSchema = new mongoose.Schema({
            userID:String,
            person:String,
            product: [String],
            no: [Number],
            phoneNo: String,
            email:String,
            registrationDate:Date
        })
        
        const allProductsSchema = new mongoose.Schema({
            item:String,
            amount:Number 
        })
        
        const Order = mongoose.model('Order',OrderSchema)
        
        
        app.post("/",async (req,res)=>{
            const userID = cookies.get('userID')
        
            const agent = new WebhookClient({request:req, response:res});
            function Ordering(agent){
                Order.findOne({userID:userID},function(err,user){
                    if(user==null){
                        const orders = new Order({
                            userID:userID,
                            product:agent.parameters.product,
                            no:agent.parameters.no
                        })
                        orders.save()
                    }else{
        
                        Order.updateOne({userID:userID},{$push:{product:agent.parameters.product,no:agent.parameters.no}},function(err){
                            if (err){
                                console.log(err);
                            }else{
                                console.log("DONE SUCCESS");
                            }
                        })
                    }
                })
                let responseText = `${agent.parameters.no[0]},${agent.parameters.product[0] } is Added Anything Else :)`
                agent.add(responseText)
            }
        
            function OrderPlace(agent){
                Order.findOne({userID:userID},function(err,user){
                    if(user==null){
                        const orders = new Order({
                            userID:userID,
                            person:agent.parameters.person.structValue.fields.name,
                            product:agent.parameters.product,
                            no:agent.parameters.no,
                            phoneNo:agent.parameters.phoneNo,
                            email:agent.parameters.email,
                            registrationDate: Date.now()
                        })
                        orders.save()
                        console.log("Order Placed ");
                    }else{
        
                        Order.updateOne({userID:userID},{phoneNo:agent.parameters.phoneNo,email:agent.parameters.email,registrationDate: Date.now()},function(err){
                            if (err){
                                console.log(err);
                            }else{
                                console.log("Order Update");
                            }
                        })
                    }
                })
                let responseText = `Thanks ${agent.parameters.person.name} For Buying Things from us .Our representative will contact you via email : ${agent.parameters.email} or phone Number: ${agent.parameters.phoneNo} and your order will be on your door step :)`
                agent.add(responseText)
            }
            let intentMap = new Map();
            intentMap.set('Order_Intent',Ordering)
            intentMap.set('order_place',OrderPlace)
        
            agent.handleRequest(intentMap)
        })
        
        

        
        


app.get("/profile", (req, res) => {
    res.send("here is your profile");
})
app.get("/about", (req, res) => {
    res.send("some information about me");
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});