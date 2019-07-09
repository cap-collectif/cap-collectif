<?php

namespace Capco\AppBundle\Behat;

use Capco\AppBundle\Helper\EnvHelper;
use Symfony\Component\HttpKernel\KernelInterface;
use Alex\MailCatcher\Behat\MailCatcherContext as Base;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Caxy\HtmlDiffBundle\Service\HtmlDiffService;

class MailCatcherContext extends Base implements KernelAwareContext
{
    /**
     * {@inheritdoc}
     */
    public function setKernel(KernelInterface $kernel)
    {
        $this->kernel = $kernel;
    }

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
            echo "\"Snapshot writen at '${file}'. You can now relaunch the testsuite.\"";

            return;
        }

        $text = file_get_contents(__DIR__ . '/snapshots/' . $file);

        if (false === strpos($content, $text)) {
            // HtmlDiffService
            $diff = $this->kernel
                ->getContainer()
                ->get('caxy.html_diff')
                ->diff($content, $text);
            $dir = __DIR__ . '/snapshots-diff/';
            if (!file_exists($dir)) {
                mkdir($dir, 0700);
            }
            $path = __DIR__ . '/snapshots-diff/' . $file;
            $newDiff = fopen($path, 'w');
            fwrite(
                $newDiff,
                $diff . '<link type="text/css" href="https://capco.dev/codes.css" rel="stylesheet">'
            );
            fclose($newDiff);

            throw new \InvalidArgumentException(
                sprintf(
                    "Snapshots didn't match ! Use 'open %s'. To regenerate snapshots, use 'fab local.qa.snapshots:emails'.",
                    $path
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
