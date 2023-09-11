import { getSession } from 'next-auth/react';
import style from './style.module.css';
import { GetServerSideProps } from 'next';

export default function Dashboard() {
    return(
        <div className={style.container}>
                meu painel
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {
    const session = await getSession({ req });

    if (!session) {
        return{
            redirect:{
                destination: '/',
                permanent: false,
            }
        }
    }

    return{
        props: {},
    }
}
