import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from "@prismicio/client"

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiClock, FiCalendar,  FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import  {format}  from 'date-fns';
import { useRouter } from 'next/router';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

interface Post {
  first_publication_date: string | null;//
  last_publication_date: string | null;
  data: {
    title: string;//
    banner: {
      url: string;//
    };
    author: string;//
    content: {
      heading: string;//
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));

    return total;
  }, 0);

  const readTime = Math.ceil(totalWords/200)

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  const formatedDate =   format(
    new Date(post.first_publication_date), 
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
    )

    // const [posts, setPosts] = useState(post)
    //   {
    //     ...post,
    //   }
  return (
    <>
      <Header />

      <img src={post.data.banner.url} alt="imagem" className={styles.banner} />
      <main className={styles.containerContentPost}>
        <h1>{post.data.title}</h1>
        <ul className={styles.containerInfo}>
          <li>
          <FiCalendar />
            {formatedDate}
          </li>
          <li>
          <FiUser />
            {post.data.author}
          </li>
          <li>
          <FiClock />
            {`${readTime} min`}
          </li>
        </ul>
        <p>* editado em {post.last_publication_date}</p>
        {post.data.content.map(content =>{
          return (
        <article key={content.heading}>
          <div>{content.heading}</div>
          <div dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}/>
        </article>
        );
        } )}
      </main>
      <footer className={styles.containerFooter}>

      </footer>
    
    </>
  )
}




// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')]
  );
    const paths = posts.results.map(post => {
      return {
        params: {
          slug: post.uid
        }
      }
    })
  return {
    paths,
    fallback: true

  }
}
export const getStaticProps = async ({ params }) => {
  
  const prismic = getPrismicClient();
  const { slug } = params;    
  const response = await prismic.getByUID("posts", String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body]
        }
      }),

    }
    
  }
  // console.log(response.data.title)
  return {
    props: {post},
    // redirect: 60 * 30, // 30 minutos
}
  // console.log(response)
}
   

