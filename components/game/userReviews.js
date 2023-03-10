import { useRouter } from "next/router";
import { useState, useRef } from "react";
import { db } from "../../config/firebase";
import { doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { useAuth } from "../../config/auth";
import Review from "./review";

export default function UserReviews({ userReviews: { ratingsList }, users, gameID }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(null);
  const commentRef = useRef("");

  if (isLoading) return <h1>Loading...</h1>;

  const handleUserReview = async () => {
    if (!user) return router.push("/signin");

    try {
      await updateDoc(doc(db, "games", gameID), {
        "reviews.ratings.ratingsList": arrayUnion({
          comment: commentRef?.current?.value,
          postedOn: Timestamp.now(),
          rating: rating,
          userUID: user.uid
        })
      });

      commentRef.current.value = "";
      setRating(null);
    } catch (error) {
      console.log(error);
    }

    router.push(router.asPath, undefined, { scroll: false });
  }

  return (
    <>
      <h2 className="text-2xl underline">User Reviews Tab</h2>
      <div className="flex flex-col mb-[2rem]">
        <h4 className="underline">Review this game</h4>
        <div>
          <label>Your rating:</label>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(parseInt(value))}
              />
            </label>
          ))}
        </div>
        <textarea ref={commentRef} className="w-[50rem] mb-2" placeholder="Comment"></textarea>
        <button onClick={() => handleUserReview()} className="w-fit text-white bg-slate-600">comment</button>
      </div>
      <h4 className="text-xl underline">User Reviews</h4>
      {ratingsList && ratingsList.map((review) => {
        let [userData] = users.filter(user => user.uid === review.userUID);
        let { photoURL, fullName } = userData;

        return (
          <Review
            key={review.userUID + review.comment + Math.random()}
            reviewType="user"
            photoURL={photoURL}
            name={fullName}
            postedOn={review.postedOn}
            assessment={review.rating}
            comment={review.comment}
          />
        )
      })}
    </>
  )
}