import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";
import firebase from "firebase/app";
import { db } from "../firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MessageIcon from "@material-ui/icons/Message";
import SendIcon from "@material-ui/icons/Send";

interface PROPS {
  //パラメーター
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
}

interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

const Post: React.FC<PROPS> = (props) => {
  const classes = useStyles();
  const user = useSelector(selectUser);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      username: "",
      timestamp: null,
    },
  ]);
  const [openComments, setOpenComments] = useState(false);
  useEffect(() => {
    //dbからデーターを取得
    const unSub = db
      .collection("posts")
      .doc(props.postId)
      .collection("comments")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            username: doc.data().username,
            timestamp: doc.data().timestamp,
          }))
        );
      });
    return () => {
      unSub();
    };
  }, [props.postId]); //第二引数　投稿が違う投稿になった場合　上の処理を実行する

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //onsubmitを実行するため　リフレッシュを防ぐ
    db.collection("posts").doc(props.postId).collection("comments").add({
      //collectionの入れ子構造　.add=>追加処理
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(), //firebaseのサーバーの時間を取得
      username: user.displayName, //Reduxのstoreの中のuserstateから取得
    });
    setComment("");
  };

  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={props.avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{props.username}</span>
              <span className={styles.post_headerTime}>
                {new Date(props.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{props.text}</p>
          </div>
        </div>
        {props.image && ( //imageデータ出力　存在するときだけprospで受け取ったimageデータを出力
          <div className={styles.post_tweetImage}>
            <img src={props.image} alt="Tweet" />
          </div>
        )}
        <MessageIcon //コメントを表示、表示させる
          className={styles.post_commentIcon}
          onClick={() => setOpenComments(!openComments)}
        />
        　　 　　　
        {openComments && (
          <>
            {/*データベースの中身を展開*/}
            {comments.map((com) => (
              <div key={com.id} className={styles.post_comment}>
                <Avatar src={com.avatar} className={classes.small} />

                <span className={styles.post_commentUser}>@{com.username}</span>
                <span className={styles.post_commentText}>{com.text}</span>
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}
            {/*ユーザーがコメントを入力するためのフォーム*/}
            <form onSubmit={newComment}>
              <div className={styles.post_form}>
                <input
                  className={styles.post_input}
                  type="text"
                  placeholder="Type new comment..."
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComment(e.target.value)
                  }
                />
                {/*送信ボタン*/}
                <button
                  disabled={!comment} //コメントが空の場合ボタンが無効化される
                  className={
                    comment ? styles.post_button : styles.post_buttonDisable
                  } //コメント有る無しでボタンの色を変える
                  type="submit"
                >
                  <SendIcon className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        )}
        　　　　
      </div>
    </div>
  );
};

export default Post;
