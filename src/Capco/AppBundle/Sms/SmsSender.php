<?php

interface SmsSender {
  public function send($from, $to, $message);
}
