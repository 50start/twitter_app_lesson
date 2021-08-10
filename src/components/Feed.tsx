import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import TweetInput from "./TweetInput";
import styles from "./Feed.module.css";
import Post from "./Post";

const Feed: React.FC = () => {
  const [posts, setPosts] = useState([
    {
      id: "",
      avatar: "",
      image: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);

  useEffect(() => {
    //databaseを取得する処理
    const unSub = db
      .collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (
          snapshot //onSnapshot=> firebaseに何らかのデーターがあるたびに毎回setPosts()の処理が走る
        ) =>
          setPosts(
            snapshot.docs.map((doc) => ({
              //mapで展開　setPost()を使って　postsのstateの中に配列の形で要素を格納
              id: doc.id, //postsの中のdocを全て取得できる
              avatar: doc.data().avatar, // ()を用いて属性(avatar)にアクセスできる
              image: doc.data().image,
              text: doc.data().text,
              timestamp: doc.data().timestamp,
              username: doc.data().username,
            }))
          )
      );
    return () => {
      unSub();
    };
  }, []); //空の配列　一回だけ実行する処理
  return (
    <div className={styles.feed}>
      Feed
      <TweetInput />
      {posts[0]?.id && ( //投稿が０の場合はレンダリングしない  [0]?id=>idを判定　&& => idが存在する場合だけ
        <>
          　　　　　　　　　　　
          {posts.map(
            (
              post //存在する場合だけレンダリングする
            ) => (
              <Post
                key={post.id}
                postId={post.id}
                avatar={post.avatar}
                image={post.image}
                text={post.text}
                timestamp={post.timestamp}
                username={post.username}
              />
            )
          )}
        </>
      )}
    </div>
  );
};

export default Feed;
