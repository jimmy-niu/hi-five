window.onload = () => {
    const friendCode = window.location.href.split("=")[1];
    const friendLink = document.querySelector("#friend-link");

    // Login to Firebase
    firebase
        .auth()
        .signInAnonymously()
        .catch(function(error) {
            alert(error.message);
        });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            if (friendCode) {
                // Add friend groups
                const db = firebase.firestore();

                Promise.all([
                    db
                        .collection("groups")
                        .doc(user.uid)
                        .set({
                            partnerID: friendCode
                        }),
                    db
                        .collection("groups")
                        .doc(friendCode)
                        .set({
                            partnerID: user.uid
                        })
                ])
                    .then(() => (friendLink.innerText = "Friend added successfully"))
                    .catch(
                        () => (friendLink.innerText = "An error occured connecting with friend")
                    );
            } else {
                // Generate friend link
                friendLink.innerText = window.location.href + `?code=${user.uid}`;
            }
        }
    });

    const friendCodeElement = document.getElementById("friend-link");
    friendCodeElement.onclick = function() {
        console.log("clicking!");
        copyToClipboard(friendCodeElement.innerText);
    };
};

const copyToClipboard = str => {
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
};
