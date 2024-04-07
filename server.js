import { ApolloServer, gql } from "apollo-server";

const server = new ApolloServer({})

// listen은 Promise
server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
})
// graph가 data의 shape를 알아야 함
// return 할 때 보내는 data, 사용자가 보내오는 data, 사용자가 쓸 수 있는 query 등의 data의 shape을 graphql한테 설명해야 함 >> Schema