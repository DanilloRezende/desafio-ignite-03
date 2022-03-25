import { GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from "@prismicio/client"
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { Link, RichText } from 'prismic-dom';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ posts }) {
  return  (
    <>
      <Header />

      <main>
        <div>
          {posts.map((post) => (
            <a href={`/posts/${post.slug}`}
              key={post.slug} >
              <strong>{post.title}</strong>
              <p>{post.subtitle}</p>
              <span>{post.author} {post.first_publication_date}</span>
              <time></time>

            </a>

          ))}
        </div>
      </main>
    </>

  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,

    })

    console.log(JSON.stringify(postsResponse, null , 2))


    const posts = await postsResponse.results.map((post) => {
      return {
        slug: post.uid,
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
        first_publication_date: post.first_publication_date // formatar a data

      }
    })
    

    return {
      props: { posts }
    }


  }

  


// export default function Home() {
//   // TODO
// }

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
