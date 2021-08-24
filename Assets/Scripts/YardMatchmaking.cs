using Socket.Quobject.SocketIoClientDotNet.Client;
using UnityEngine;
using UnityEngine.UI;
using System;
using System.IO;
using System.Collections.Generic;
using Random = UnityEngine.Random;
using System.Linq;
using TMPro;

public class YardMatchmaking : MonoBehaviour
{
    public List<string> randomWordList;
    private WebGLSocketIOInterface socket;
    public WebGLNativeInputField usernameField;
    public InputField chatTextField;
    public InputField inviteField;
    public InputField partyChatField;
    public InputField lobbyChatField;
    public Text inviteText;
    public Text chatBox;
    public Text streak1Text;
    public Text streak2Text;
    public Text streak3Text;
    public Text streakLobby;
    public Text streakGame;
    public TextMeshProUGUI partyMember1;
    public TextMeshProUGUI partyMember2;
    public TextMeshProUGUI partyMember3;
    public Text scoreText;
    public float countdownNum = 10;
    public GameObject joinLobbyMenu;
    public GameObject roomMenu;
    private bool displayMessage;
    private bool inviteRecieved;
    private bool partyJoin;
    private bool joiningRoom;
    private bool leavingRoom;
    private bool enableButtons;
    private string chatToPost;
    private string inviteSender;
    private bool displayKings;
    private bool displayChallengers;
    private bool isKing;
    private bool isChallenger;
    private bool updateStreaks;
    private bool freeWin;
    private string streak1;
    private string streak2;
    private string streak3;
    //public string[] randomWords;
    public GameObject loginScreen;
    public GameObject mainLobbyScreen;
    public GameObject lobbyScreen;
    public GameObject gameScreen;
    public GameObject winButton;
    public GameObject lossButton;
    public GameObject winScreen;
    public GameObject loseScreen;
    public GameObject inviteGroup;
    public bool isLeader;
    public string[] partyMembers;
    private string nickname;
    public string newMember;
    private string newMember2;
    private string roomToJoin;
    public int chatRoom;
    public Text king1Text;
    public Text king2Text;
    public Text king3Text;
    public Text king4Text;
    public Text king5Text;
    public Text king6Text;
    public Text king7Text;
    public Text king8Text;
    public Text king9Text;
    public Text lobbyKing1Text;
    public Text lobbyKing2Text;
    public Text lobbyKing3Text;
    public TextMeshProUGUI gameKing1Text;
    public TextMeshProUGUI gameKing2Text;
    public TextMeshProUGUI gameKing3Text;
    public Text challenger1Text;
    public Text challenger2Text;
    public Text challenger3Text;
    public Text challenger4Text;
    public Text challenger5Text;
    public Text challenger6Text;
    public Text challenger7Text;
    public Text challenger8Text;
    public Text challenger9Text;
    public Text lobbyChallenger1Text;
    public Text lobbyChallenger2Text;
    public Text lobbyChallenger3Text;
    public TextMeshProUGUI gameChallenger1Text;
    public TextMeshProUGUI gameChallenger2Text;
    public TextMeshProUGUI gameChallenger3Text;
    private string king1;
    private string king2;
    private string king3;
    private string king4;
    private string king5;
    private string king6;
    private string king7;
    private string king8;
    private string king9;
    private string challenger1;
    private string challenger2;
    private string challenger3;
    private string challenger4;
    private string challenger5;
    private string challenger6;
    private string challenger7;
    private string challenger8;
    private string challenger9;


    void Start()
    {
        //TextAsset mytxtData = (TextAsset)Resources.Load("EveryWord");
        //string[] stringSeparators = new string[] { "\r\n" };
        //randomWordList = mytxtData.text.Split(stringSeparators, StringSplitOptions.None).ToList();

        Debug.Log("start");
        socket = WebGLSocketIOInterface.instance;
        
        socket.On(QSocket.EVENT_CONNECT, () => {
            Debug.Log("Connected");
            //socket.Emit("chat message", "test");
        });
        
        socket.On("chat message", data => {
            Debug.Log(data);
            //chatBox.text = chatBox.text + "\n" + data;
            displayMessage = true;
            chatToPost = data.ToString();
        });

        socket.On("display-error", data => {
            Debug.Log("Error Occurred: " + data);
        });

        socket.On("lobby-list", data =>
        {
            Debug.Log("We got the list.");
        });

        socket.On("get-invited", data =>
        {
            inviteRecieved = true;
            inviteSender = data;
        });

        socket.On("join-party", data =>
        {
            if (string.IsNullOrEmpty(newMember))
            {
                
                newMember = data;
            }
            else
            {
                newMember2 = data;
            }
            partyJoin = true;
        });

        socket.On("join-room", data =>
        {
            joiningRoom = true;
            roomToJoin = data;
        });

        socket.On("leave-room", () =>
        {
            leavingRoom = true;
        });

        socket.On("clear-kings", data =>
        {
            Debug.Log("King display?");
            int roomToClear = int.Parse(data);
            switch (roomToClear)
            {
                case 1:
                    king1 = "";
                    king2 = "";
                    king3 = "";
                    break;
                case 2:
                    king4 = "";
                    king5 = "";
                    king6 = "";
                    break;
                case 3:
                    king7 = "";
                    king8 = "";
                    king9 = "";
                    break;
            }
            displayKings = true;
        });

        socket.On("clear-challengers", data =>
        {
            Debug.Log("Challenger display?");
            int roomToClear = int.Parse(data);
            switch (roomToClear)
            {
                case 1:
                    challenger1 = "";
                    challenger2 = "";
                    challenger3 = "";
                    break;
                case 2:
                    challenger4 = "";
                    challenger5 = "";
                    challenger6 = "";
                    break;
                case 3:
                    challenger7 = "";
                    challenger8 = "";
                    challenger9 = "";
                    break;
            }
            displayChallengers = true;
        });

        socket.On("new-king-1", data =>
        {
            if (string.IsNullOrEmpty(king1))
            {
                king1 = data;
            }
            else if(string.IsNullOrEmpty(king2))
            {
                king2 = data;
            }
            else
            {
                king3 = data;
            }
            if(nickname == data)
            {
                isKing = true;
            }
            displayKings = true;
        });

        socket.On("new-king-2", data =>
        {
            if (string.IsNullOrEmpty(king4))
            {
                king4 = data;
            }
            else if (string.IsNullOrEmpty(king5))
            {
                king5 = data;
            }
            else
            {
                king6 = data;
            }
            if (nickname == data)
            {
                isKing = true;
            }
            displayKings = true;
        });

        socket.On("new-king-3", data =>
        {
            if (string.IsNullOrEmpty(king7))
            {
                king7 = data;
            }
            else if (string.IsNullOrEmpty(king8))
            {
                king8 = data;
            }
            else
            {
                king9 = data;
            }
            if (nickname == data)
            {
                isKing = true;
            }
            displayKings = true;
        });

        socket.On("new-challenger-1", data =>
        {
            if (string.IsNullOrEmpty(challenger1))
            {
                challenger1 = data;
            }
            else if (string.IsNullOrEmpty(challenger2))
            {
                challenger2 = data;
            }
            else
            {
                challenger3 = data;
            }
            if (nickname == data)
            {
                isChallenger = true;
            }
            displayChallengers = true;
        });

        socket.On("new-challenger-2", data =>
        {
            if (string.IsNullOrEmpty(challenger4))
            {
                challenger4 = data;
            }
            else if (string.IsNullOrEmpty(challenger5))
            {
                challenger5 = data;
            }
            else
            {
                challenger6 = data;
            }
            if (nickname == data)
            {
                isChallenger = true;
            }
            displayChallengers = true;
        });

        socket.On("new-challenger-3", data =>
        {
            if (string.IsNullOrEmpty(challenger7))
            {
                challenger7 = data;
            }
            else if (string.IsNullOrEmpty(challenger8))
            {
                challenger8 = data;
            }
            else
            {
                challenger9 = data;
            }
            if (nickname == data)
            {
                isChallenger = true;
            }
            displayChallengers = true;
        });

        socket.On("update-1-streak", data =>
        {
            streak1 = data;
            updateStreaks = true;
        });

        socket.On("update-2-streak", data =>
        {
            streak2 = data;
            updateStreaks = true;
        });
        
        socket.On("update-3-streak", data =>
        {
            streak3 = data;
            updateStreaks = true;
        });

        socket.On("enable-buttons", () =>
        {
            enableButtons = true;
        });

        socket.On("free-win", () =>
        {
            freeWin = true;
        });
    }

    private void Update()
    {
        
        if (displayMessage)
        {
            DisplayMessage();
        }
        if (inviteRecieved)
        {
            InviteRecieved();
        }
        if (partyJoin)
        {
            PartyJoin();
        }
        if (joiningRoom)
        {
            JoiningRoom();
        }
        if (displayKings)
        {
            DisplayKings();
        }
        if (displayChallengers)
        {
            DisplayChallengers();
        }
        if (isKing || isChallenger)
        {
            if (!string.IsNullOrEmpty(lobbyChallenger1Text.text))
            {
                StartMatch();
            }
        }
        if (leavingRoom)
        {
            LeavingRoom();
        }
        if (updateStreaks)
        {
            UpdateStreaks();
        }
        if (freeWin)
        {
            freeWin = false;
            Win();
        }
        if (enableButtons)
        {
            if(isKing || isChallenger)
            {
                EnableButtons();
            }
        }
        if (Input.GetKeyDown(KeyCode.Space))
        {
            Debug.Log("Space Hit");
            HiMessage();
        }
    }

    private void OnDestroy()
    {
        socket.Disconnect();
    }

    public void DeliverMessage()
    {
       if(chatRoom == 1)
        {
            socket.Emit("room1 chat message", lobbyChatField.text);
        }
        else if (chatRoom == 2)
        {
            socket.Emit("room2 chat message", lobbyChatField.text);
        }
        else if (chatRoom == 3)
        {
            socket.Emit("room3 chat message", lobbyChatField.text);
        }
    }

    public void PartyChat()
    {
        if (partyChatField.text.Length > 0)
        {
            socket.Emit("party chat message", partyChatField.text);
        }
    }

   

    private void DisplayMessage()
    {
        displayMessage = false;
        chatBox.text = chatBox.text + "\n" + chatToPost;
    }

    public void HiMessage()
    {
        Debug.Log("Try sending Hi");
        socket.Emit("chat message", ("[Hi]"));
        Debug.Log("Said Hi");
    }
    public void SetNickname()
    {
        if (usernameField.text.Length > 0)
        {
            nickname = usernameField.text;
            loginScreen.SetActive(false);
            mainLobbyScreen.SetActive(true);
            partyMember1.text = nickname;
            socket.Emit("set-name", nickname);
        }
    }

    public void SendInvite()
    {
        if(inviteField.text.Length > 0)
        {
            socket.Emit("invite-player", inviteField.text);
            inviteField.text = "";
            isLeader = true;
        }
    }

    public void AcceptInvite()
    {
        isLeader = false;
        socket.Emit("accept-invite", inviteSender);
    }

    public void InviteRecieved()
    {
        inviteRecieved = false;
        inviteGroup.SetActive(true);
        inviteText.text = "You got an invite from " + inviteSender;
    }

    private void PartyJoin()
    {
        partyJoin = false;
        partyMember2.text = newMember;
        partyMember3.text = newMember2;
    }

    private void JoiningRoom()
    {
        joiningRoom = false;
        lobbyScreen.SetActive(true);
        mainLobbyScreen.SetActive(false);
        switch (roomToJoin)
        {
            case "room1":
                chatRoom = 1;
                lobbyKing1Text.text = king1;
                lobbyKing2Text.text = king2;
                lobbyKing3Text.text = king3;
                lobbyChallenger1Text.text = challenger1;
                lobbyChallenger2Text.text = challenger2;
                lobbyChallenger3Text.text = challenger3;
                break;
            case "room2":
                chatRoom = 2;
                lobbyKing1Text.text = king4;
                lobbyKing2Text.text = king5;
                lobbyKing3Text.text = king6;
                lobbyChallenger1Text.text = challenger4;
                lobbyChallenger2Text.text = challenger5;
                lobbyChallenger3Text.text = challenger6;
                break;
            case "room3":
                chatRoom = 3;
                lobbyKing1Text.text = king7;
                lobbyKing2Text.text = king8;
                lobbyKing3Text.text = king9;
                lobbyChallenger1Text.text = challenger7;
                lobbyChallenger2Text.text = challenger8;
                lobbyChallenger3Text.text = challenger9;
                break;
        }
    }

    private void LeavingRoom()
    {
        leavingRoom = false;
        gameScreen.SetActive(false);
        mainLobbyScreen.SetActive(true);
        isKing = false;
        isChallenger = false;
        chatRoom = 0;
    }

    private void DisplayKings()
    {
        displayKings = false;
        king1Text.text = king1;
        king2Text.text = king2;
        king3Text.text = king3;
        king4Text.text = king4;
        king5Text.text = king5;
        king6Text.text = king6;
        king7Text.text = king7;
        king8Text.text = king8;
        king9Text.text = king9;
        switch (roomToJoin)
        {
            case "room1":
                lobbyKing1Text.text = king1;
                lobbyKing2Text.text = king2;
                lobbyKing3Text.text = king3;
                gameKing1Text.text = king1;
                break;
            case "room2":
                lobbyKing1Text.text = king4;
                lobbyKing2Text.text = king5;
                lobbyKing3Text.text = king6;
                gameKing1Text.text = king4;
                break;
            case "room3":
                lobbyKing1Text.text = king7;
                lobbyKing2Text.text = king8;
                lobbyKing3Text.text = king9;
                gameKing1Text.text = king7;
                break;
            default:
                break;
        }
    }

    private void DisplayChallengers()
    {
        displayChallengers = false;
        challenger1Text.text = challenger1;
        challenger2Text.text = challenger2;
        challenger3Text.text = challenger3;
        challenger4Text.text = challenger4;
        challenger5Text.text = challenger5;
        challenger6Text.text = challenger6;
        challenger7Text.text = challenger7;
        challenger8Text.text = challenger8;
        challenger9Text.text = challenger9;
        switch (roomToJoin)
        {
            case "room1":
                lobbyChallenger1Text.text = challenger1;
                lobbyChallenger2Text.text = challenger2;
                lobbyChallenger3Text.text = challenger3;
                gameChallenger1Text.text = challenger1; 
                break;
            case "room2":
                lobbyChallenger1Text.text = challenger4;
                lobbyChallenger2Text.text = challenger5;
                lobbyChallenger3Text.text = challenger6;
                gameChallenger1Text.text = challenger4;
                break;
            case "room3":
                lobbyChallenger1Text.text = challenger7;
                lobbyChallenger2Text.text = challenger8;
                lobbyChallenger3Text.text = challenger9;
                gameChallenger1Text.text = challenger7;
                break;
            default:
                break;
        }
    }

    private void StartMatch()
    {
        gameScreen.SetActive(true);
        lobbyScreen.SetActive(false);
        if (isLeader)
        {
            winButton.SetActive(true);
            lossButton.SetActive(true);
        }
        gameKing1Text.text = lobbyKing1Text.text;
        gameKing2Text.text = lobbyKing2Text.text;
        gameKing3Text.text = lobbyKing3Text.text;
        gameChallenger1Text.text = lobbyChallenger1Text.text;
        gameChallenger2Text.text = lobbyChallenger2Text.text;
        gameChallenger3Text.text = lobbyChallenger3Text.text;
    }

    

    private void UpdateStreaks()
    {
        streak1Text.text = streak1;
        streak2Text.text = streak2;
        streak3Text.text = streak3;
        switch (chatRoom)
        {
            case 1:
                streakLobby.text = streak1;
                streakGame.text = streak1;
                break;

            case 2:
                streakLobby.text = streak2;
                streakGame.text = streak2;
                break;

            case 3:
                streakLobby.text = streak3;
                streakGame.text = streak3;
                break;

            default:
                break;
        }
    }

    private void EnableButtons()
    {
        winButton.SetActive(true);
        lossButton.SetActive(true);
    }

    public void RequestRoom(string roomToJoin)
    {
        if (isLeader)
        {
            socket.Emit("request-room", roomToJoin);
        }
    }

    public void Win()
    {

        if (isKing)
        {
            socket.Emit("king-win", roomToJoin);
        }
        else
        {
            socket.Emit("challenger-win", roomToJoin);
        }
    }

    public void Lose()
    {
        if (isKing)
        {
            socket.Emit("challenger-win", roomToJoin);
        }
        else
        {
            socket.Emit("king-win", roomToJoin);
        }
    }

    
}