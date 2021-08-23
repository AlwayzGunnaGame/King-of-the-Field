using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public class KeyboardActivation : MonoBehaviour, ISelectHandler
{
    private TouchScreenKeyboard keyboard;
    public void OnSelect(BaseEventData eventData)
    {
        keyboard = TouchScreenKeyboard.Open("", TouchScreenKeyboardType.Default);
    }
}
