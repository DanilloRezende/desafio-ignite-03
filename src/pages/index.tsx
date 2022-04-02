import { GetStaticProps } from 'next';
import Head from 'next/head';

import { format } from 'date-fns'
import { FiCalendar,  FiUser } from 'react-icons/fi';

import Prismic from "@prismicio/client"
import { getPrismicClient } from '../services/prismic';

import  Link  from "next/link"
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import {  RichText } from 'prismic-dom';
import Header from '../components/Header';
import { useState } from 'react';
import {ptBR} from 'date-fns/locale';

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
  // map(arg0: (post: any) => JSX.Element): import("react").ReactNode;
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  //----Devido a ao teste que na linha 136 exige um retorno de texto...
  //----foi necessário formatar a data 
  const formatedData = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date), 
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
        )
        
    }});
    
    
  const [posts, setPosts] = useState<Post[]>(formatedData)
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);
  
  
  

  
      
  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }
    const postsResults = await fetch(`${nextPage}`)
      .then(response => response.json()
      );
    console.log(postsResults)
    setNextPage(postsResults.next_page);
    setCurrentPage(postsResults.page);

    const newPosts = postsResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy'),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }


      }
    });

    setPosts([...posts, ...newPosts])
  }
  // console.log(postsPagination)


  return (
    <>
      <Header />

      <main className={styles.contentContainer}>    
          {posts.map((post) => (
            <Link 
              href={`/post/${post.uid}`}
              key={post.uid}
            >
            <a className={styles.postsContainer}>           
                             
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div className={styles.infoContainer}>
              <FiCalendar />
              <time>{post.first_publication_date}</time>
              <FiUser />
              <span>{post.data.author} </span>
              </div>
              
            </a>
            </Link>
          ))}
        {nextPage && (
        <button 
          className={styles.buttonContainer}
          onClick={handleNextPage}
        >Carregar mais posts</button>
        )}
      </main>
    </>

  )
}


export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1



    })

  // console.log(JSON.stringify(postsResponse, null, 2))

  const posts = await postsResponse.results.map((post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }

    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: { postsPagination }
  }



}




