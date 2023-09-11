import { getSession } from 'next-auth/react';
import style from './style.module.css';
import { GetServerSideProps } from 'next';
import TextArea from '@/components/TextArea';
import Head from 'next/head';
import { FiShare2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import { ChangeEvent, FormEvent, useState } from 'react';

import { db } from '@/services/firebaseConnection';
import { addDoc, collection } from 'firebase/firestore';

interface HomeProps {
    user: {
        email: string
    }
}

export default function Dashboard({ user }: HomeProps) {

    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);

    function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
        setPublicTask(e.target.checked);
    }

    const handleAddTask = async (e: FormEvent) => {
        e.preventDefault();
        
        if ( input === "" ) {
            return;
        }

        try {
            await addDoc(collection(db, "tarefas"), {
                tarefa: input,
                created: new Date(),
                user: user.email,
                publicTask: publicTask
            });

            setInput("");
            setPublicTask(false)
        } catch(err) {
            console.log(err)
        }
    }

    return (
        <div className={style.container}>
            <Head>
                Meu painel de tarefas
            </Head>

            <main className={style.main}>
                <section className={style.content}>
                    <div className={style.contentForm}>
                        <h1 className={style.title}>Qual sua tarefa?</h1>

                        <form onSubmit={handleAddTask}>
                            <TextArea value={input} onChange={(e:ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)} placeholder='Digite a sua tarefa...' />

                            <div className={style.checkboxArea}>
                                <input checked={publicTask} onChange={handleChangePublic} type="checkbox" className={style.checkbox} name='checkbox' />
                                <label htmlFor="checkbox">Deixar tarefa pública</label>
                            </div>

                            <button type='submit' className={style.button}>Registrar</button>
                        </form>
                    </div>
                </section>

                <section className={style.taskContainer}>
                    <h1>Minhas tarefas</h1>

                    <article className={style.task}>
                        <div className={style.tagContainer}>
                            <label className={style.tag}>Público</label>
                            <button className={style.shareButton}>
                                <FiShare2 size={22} color="#3183ff" />
                            </button>
                        </div>

                        <div className={style.taskContent}>
                            <p>Minha primeira tarefa de exemplo</p>
                            <button className={style.trashButton}>
                                <FaTrash size={24} color="#ea3140" />
                            </button>
                        </div>
                    </article>
                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    return {
        props: {
            user: {
                email: session?.user?.email
            }
        },
    }
}
