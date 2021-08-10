import React, { useState } from "react";
import styles from "./TweetInput.module.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { auth, db, storage } from "../firebase";
import { Avatar, Button, IconButton } from "@material-ui/core";
import firebase from "firebase/app";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";

const TweetInput: React.FC = () => {
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState("");

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      e.target.value = "";
    }
  };
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //submitが実行された時にブラウザが自動でリフレッシュされてしまう　preventDefaultを実行してリフレッシュを防ぐ
    if (tweetImage) {
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImage.name;
      const uploadTweetImg = storage.ref(`images/${fileName}`).put(tweetImage);
      //16桁のfileNameを使って　storageに格納した返り値を格納　imageにfiledataを格納　putでファイルオブジェクトを指定
      //storage.refの返り値をuploadTweetImgに格納している
      uploadTweetImg.on(
        firebase.storage.TaskEvent.STATE_CHANGED, //この下に３つ関数を持たせることができる //1, uploadの進捗を管理できる　2, エラーのハンドリング　3, 正常終了が実行された時の関数
        //onメソッド=>storageに対して何らかのstateの変化があった場合に実行される後処理を追加することができる
        () => {}, // 1,進捗管理の関数（プログレス）今回は機能を実装しない　空の関数
        (err) => {
          // 2,何らかのエラーを検知した場合はalertメッセージを出力
          alert(err.message);
        },
        // 3,正常終了した場合 storageにuploadした画像のurlを取得してくる
        async () => {
          await storage
            .ref("images")
            .child(fileName)
            .getDownloadURL()
            .then(
              //child(fileName)=>参照したいfileName getDownloadURL()=>対象のfileのurlパスを取得
              //成功したときにthenを使って下記の処理
              async (url) => {
                //urlリンクの取得に成功した場合　urlリンクを使って　cloud firestoreに投稿データーをuploadする
                await db.collection("posts").add({
                  //add(追加する)
                  //追加するオブジェクトを定義
                  avater: user.photoUrl,
                  image: url,
                  text: tweetMsg, //stateの内容
                  timestamp: firebase.firestore.FieldValue.serverTimestamp(), //現在の時刻
                  username: user.displayName, //ログインしているuserのdisplayName
                });
              }
            );
        }
      );
    } else {
      db.collection("posts").add({
        avater: user.photoUrl,
        image: "",
        text: tweetMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      });
    }
    setTweetImage(null);
    setTweetMsg("");
  };
  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            className={styles.tweet_input}
            placeholder="What's happening?"
            type="text"
            autoFocus
            value={tweetMsg}
            onChange={(e) => setTweetMsg(e.target.value)}
          />
          <IconButton>
            <label>
              <AddAPhotoIcon
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                className={styles.tweet_hiddenIcon}
                type="file"
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
};

export default TweetInput;
