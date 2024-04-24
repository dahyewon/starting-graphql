import styled from "styled-components";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";

const ALL_MOVIES = gql`
  query getMovies {
    allMovies {
      id
      title
      large_cover_image
    }
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background-color: black;
`;

const Header = styled.header`
  /* background-image: linear-gradient(-45deg, #d754ab, #fd723a); */
  background-image: linear-gradient(-180deg, #1a074a, #000000);
  height: 45vh;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 70px;
  /* font-weight: 600; */
  margin-bottom: 20px;
  font-family: fantasy;
  @media screen and (max-width: 600px) {
    font-size: 45px;
  }
`;

const Loading = styled.div`
  font-size: 18px;
  opacity: 0.5;
  font-weight: 500;
  margin-top: 10px;
`;

const MoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 25px;
  width: 60%;
  position: relative;
  top: -50px;
  
  @media screen and (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media screen and (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
    width: 90%;
  }
`;

const PosterContainer = styled.div`
  /* height: 400px; */
  position: relative;
  border-radius: 7px;
  width: 100%;
  padding-bottom: 150%;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  background-color: transparent;
  overflow: hidden;
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
    transform: translateY(-10px);
    &::after {
      content: '${(props) => props.title}';
      padding-right: 10px;
      position: absolute;
      bottom: 20px;
      left: 20px;
      color: white;
      font-family: fantasy;
      font-size: 20px;
    }
  }
`;

const PosterBg = styled.div`
  background-image: url(${(props) => props.background});
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-size: cover;
  background-position: center center;
  border-radius: 7px;
  transition: filter 0.3s ease-in-out;
  
  &:hover {
    filter: brightness(50%);
  }
`;

export default function Movies() {
  const { data, loading } = useQuery(ALL_MOVIES);
  return (
    <Container>
      <Header>
        <Title>🏆Hall Of Fame🍿</Title>
      </Header>
      {loading && <Loading>Loading...</Loading>}
      <MoviesGrid>
        {data?.allMovies?.map((movie) => (
          <PosterContainer key={movie.id} title={movie.title}>
            <Link to={`/movies/${movie.id}`}>
              <PosterBg background={movie.large_cover_image} />
            </Link>
          </PosterContainer>
        ))}
      </MoviesGrid>
    </Container>
  );
}