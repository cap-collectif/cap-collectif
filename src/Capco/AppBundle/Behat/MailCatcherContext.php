<?php

namespace Capco\AppBundle\Behat;

use Alex\MailCatcher\Behat\MailCatcherContext as Base;
use Capco\AppBundle\Helper\EnvHelper;
use Caxy\HtmlDiff\HtmlDiff;

class MailCatcherContext extends Base
{
    /**
     * @Then email should match snapshot :file
     */
    public function emailContentShouldMatch(string $file)
    {
        $writeSnapshot = EnvHelper::get('SNAPSHOTS');

        $message = $this->getCurrentMessage();

        if (!$message->isMultipart()) {
            $content = $message->getContent();
        } elseif ($message->hasPart('text/html')) {
            $content = $this->getCrawler($message)->text();
        } elseif ($message->hasPart('text/plain')) {
            $content = $message->getPart('text/plain')->getContent();
        } else {
            throw new \RuntimeException(sprintf('Unable to read mail'));
        }

        if ($writeSnapshot) {
            $newSnapshot = fopen(__DIR__ . '/snapshots/' . $file, 'w');
            fwrite($newSnapshot, $content);
            fclose($newSnapshot);
            echo "\"Snapshot writen at ${file}, you can now relaunch the testsuite.\"";

            return;
        }

        $text = file_get_contents(__DIR__ . '/snapshots/' . $file);

        if (false === strpos($content, $text)) {
            $diff = (new HtmlDiff($content, $text))->build();

            throw new \InvalidArgumentException(
                sprintf(
                    "Snapshots didnt match \"%s\", if you want to update snapshots, use 'fab local.qa.snapshots:emails'.",
                    $diff
                )
            );
        }
    }

    /**
     * @param Message $message
     *
     * @return Crawler
     */
    private function getCrawler(Message $message)
    {
        if (!class_exists('Symfony\Component\DomCrawler\Crawler')) {
            throw new \RuntimeException(
                'Can\'t crawl HTML: Symfony DomCrawler component is missing from autoloading.'
            );
        }

        return new Crawler($message->getPart('text/html')->getContent());
    }

    /**
     * @return Message|null
     */
    private function getCurrentMessage()
    {
        if (null === $this->currentMessage) {
            throw new \RuntimeException('No message selected');
        }

        return $this->currentMessage;
    }
}
