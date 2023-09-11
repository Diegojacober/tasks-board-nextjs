import { getSession } from 'next-auth/react';
import style from './style.module.css';
import { GetServerSideProps } from 'next';
import TextArea from '@/components/TextArea';
import Head from 'next/head';
import { FiShare2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { db } from '@/services/firebaseConnection';
import { addDoc, collection, orderBy, where, onSnapshot, query, doc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';

interface HomeProps {
    user: {
        email: string
    }
}

interface TaskProps {
    id: string,
    created: Date,
    public: boolean,
    tarefa: string,
    user: string
}

export default function Dashboard({ user }: HomeProps) {

    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [tasks, setTasks] = useState<TaskProps[]>([]);

    function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
        setPublicTask(e.target.checked);
    }

    const handleAddTask = async (e: FormEvent) => {
        e.preventDefault();

        if (input === "") {
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
        } catch (err) {
            console.log(err)
        }
    }

    async function handleShare(id: string) {
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        )

        alert("url copiada com sucesso")
    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, "tarefas", id)

        await deleteDoc(docRef)

        alert("Tarefa deletada com sucesso")
        return;
    }

    useEffect(() => {
        async function loadTarefas() {
            const tarefasRef = collection(db, "tarefas")

            const q = query(tarefasRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            )

            onSnapshot(q, (snapshot) => {
                let list = [] as TaskProps[];
                snapshot.forEach(doc => {
                    list.push({
                        id: doc.id,
                        created: doc.data().created,
                        tarefa: doc.data().tarefa,
                        user: doc.data().user,
                        public: doc.data().publicTask
                    })
                })

                console.log(list)
                setTasks(list)
            })
        }

        loadTarefas();
    }, [user?.email])

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
                            <TextArea value={input} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)} placeholder='Digite a sua tarefa...' />

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

                    {tasks.map((item) => (
                        <article key={item.id} className={style.task}>
                            {item.public && (
                                <div className={style.tagContainer}>
                                    <label className={style.tag}>Público</label>
                                    <button className={style.shareButton} onClick={() => handleShare(item.id)}>
                                        <FiShare2 size={22} color="#3183ff" />
                                    </button>
                                </div>
                            )}

                            <div className={style.taskContent}>

                                {item.public ? (
                                    <Link href={`/task/${item.id}`}><p>{item.tarefa}</p></Link>
                                ) : (
                                    <p>{item.tarefa}</p>
                                )}

                                <button className={style.trashButton} onClick={() => handleDeleteTask(item.id)}>
                                    <FaTrash size={24} color="#ea3140" />
                                </button>
                            </div>
                        </article>
                    ))}
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
