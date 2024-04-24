import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";
import dotenv from 'dotenv';
dotenv.config();
import zlib from 'zlib';
import { PassThrough } from 'stream';

// fake DB
let tweets = [
  {
    id: "1",
    text: "first",
    userId: "2",
  },
  {
    id: "2",
    text: "second",
    userId: "1",
  },
  {
    id: "3",
    text: "third",
    userId: "2",
  },
  {
    id: "4",
    text: "fourth",
    userId: "1",
  },
]

let users = [
  {
    id: "1",
    firstName : "nico",
    lastName: "las",
  },
  {
    id: "2",
    firstName: "hey",
    lastName: "yo",
  }
]


// graph가 data의 shape를 알아야 함
// return 할 때 보내는 data, 사용자가 보내오는 data, 사용자가 쓸 수 있는 query 등의 data의 shape을 graphql한테 설명해야 함 >> Schema
const typeDefs = gql`
  type User {
    id:ID!
    firstName: String!
    lastName: String!
    """
    Is the sum of firstName + lastName as a string
    """
    fullName: String!
  }
  """
  Tweet object represents a resource for a Tweet
  """
  type Tweet {
    id: ID!
    text: String!
    author: User!
  }

  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    ping: String!
    movie(id:String!):Movie
    """GET all Recommended Books"""
    allBooks: [Book!]!
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    """
    Deletes a Tweet if found, else returns false
    """
    deleteTweet(id: ID!): Boolean!
  }
  type Movie {
    id : Int!
    url : String!
    imdb_code : String!
    title :String!
    title_english :String!
    title_long :String!
    slug :String!
    year : Int!
    rating : Float!
    runtime : Int!
    genres : [String!]!
    summary : String
    description_full : String!
    synopsis : String
    yt_trailer_code : String!
    language : String!
    background_image :String!
    background_image_original :String!
    small_cover_image :String!
    medium_cover_image :String!
    large_cover_image : String!
  }
  type Book {
    title: String!
    alternativeTitle: String
    creator: String!
    regDate: String!
    collectionDb: String!
    subjectCategory: String!
    subjectKeyword: String
    extent: String
    description: String!
    spatialCoverage: String
    temporal: String
    person: String
    language: String
    sourceTitle: String
    referenceIdentifier: String!
    rights: String!
    copyrightOthers: String
    url: String!
    contributor: String
  }
` // Schema Definition Language

const resolvers = {
  Query: {
    allTweets() {
      return tweets;
    },
    tweet(root, { id }){
      return tweets.find(tweet => tweet.id === id);
    },
    allUsers() {
      return users;
    },
    allMovies() {
      return fetch("https://yts-proxy.now.sh/list_movies.json?sort_by=like_count&limit=48").then(r => r.json()).then(json => json.data.movies);
    },
    movie(_, { id }) {
      return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
      .then(r => r.json())
      .then(json => json.data.movie);
    },
    // 호출 실패 header check 문제가 있다
    allBooks() {
      return fetch(`http://api.kcisa.kr/openapi/service/rest/meta13/getNLSF0401?serviceKey=${process.env.BOOK_API_KEY}`)
      .then(response => {
        const contentEncoding = response.headers.get('content-encoding');
        if (contentEncoding && contentEncoding.includes('gzip')) {
          const gzipStream = zlib.createGunzip();
          response.body.pipe(gzipStream);
          return gzipStream;
        }
        return response.body;
      })
      .then(unzippedBody => {
        const chunks = [];
        unzippedBody.on('data', (chunk) => {
          chunks.push(chunk);
        });
        unzippedBody.on('end', () => {
          const rawData = Buffer.concat(chunks).toString();
          try {
            const jsonData = JSON.parse(rawData);
            const items = jsonData.response.body.items.item;
            items.forEach(item => {
              console.log('Title:', item.title);
              console.log('Creator:', item.creator);
              console.log('Description:', item.description);
              console.log('URL:', item.url);
              console.log('-----------------------------');
            });
          } catch (error) {
            console.error(error);
          }
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  },
  Mutation: {
    postTweet(__, { text, userId }) {
      const newTweet = {
        id: tweets.length + 1,
        text,
        userId,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(__, { id }) {
      const tweet = tweets.find(tweet => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter(tweet => tweet.id !== id)
      return true;
    }
  },
  User: {
    fullName(root) {
      return root.firstName + " " + root.lastName;
    }
  },
  Tweet: {
    author({ userId }) {
      return users.find(user => user.id === userId);
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

// listen은 Promise
server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
})

