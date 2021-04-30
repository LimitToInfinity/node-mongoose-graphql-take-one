const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('graphql-tools');
require('dotenv').config();

const uri = `mongodb+srv://admin123:${process.env.MONGO_PASSWORD}@test1.cifyy.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 9001;

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('MongoDB Connected! 🙌'))
  .catch(error => console.error(error));

const typeDefs = `
  type Query {
    flowers: [Flower]
    flower(_id: ID!): Flower
  }
  type Flower {
    _id: ID!
    kind: String!
    petals: Int
  }
  
  input FlowerInput {
    kind: String!
    petals: Int
  }
  type Mutation {
    createFlower(flower: FlowerInput): Flower
  }
`;

const FlowerSchema = new mongoose.Schema({
  kind: {
    type: String,
    required: true
  },
  petals: Number,
  garden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Garden'
  }
});

const GardenSchema = new mongoose.Schema({
  name: String,
  size: Number,
  flowers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Flower'
  }]
})

const Flower = mongoose.model('Flower', FlowerSchema);

// const Garden = mongoose.model('Garden', GardenSchema);

const resolvers = {
  Query: {
    flowers: async () => await Flower.find(),
    flower: async (_, { _id }) => await Flower.findById(_id)
  },
  Mutation: {
    createFlower: async (_, { flower }) => await Flower.create(flower)
  }
};

// const gardenResolvers = {
//   Query: {
//     garden: async () => await Garden.find()
//   }
// };

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
  // resolvers: [flowerResolvers, gardenResolvers]
})

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

app.listen(port, () => console.log(`listening on port ${port}`));
