<?php

class TwilioSmsSender implements SmsSender {

  protected $api;

  public function __construct($api) {
    $this->api = $api;
  }

  public function send($from, $to, $message) {
    $this->api->account->messages->sendMessage(
      $from,
      $to,
      $message,
    );
  }

}
