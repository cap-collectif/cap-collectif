<?php

namespace Capco\AppBundle\Behat;

use Alex\MailCatcher\Behat\MailCatcherContext as Base;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Capco\AppBundle\Helper\EnvHelper;
use Symfony\Component\HttpKernel\KernelInterface;

class MailCatcherContext extends Base implements KernelAwareContext
{
    final public const SNAPSHOTS_PATH = '/var/www/__snapshots__/emails/';
    final public const SNAPSHOTS_DIFF_PATH = '/var/www/__snapshots-diff__/';

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
        $writeSnapshot = EnvHelper::get('UPDATE_SNAPSHOTS');

        $message = $this->getCurrentMessage();

        if (!$message->isMultipart()) {
            $content = $message->getContent();
        } elseif ($message->hasPart('text/html')) {
            $content = $this->getCrawler($message)->text();
        } elseif ($message->hasPart('text/plain')) {
            $content = $message->getPart('text/plain')->getContent();
        } else {
            throw new \RuntimeException('Unable to read mail');
        }

        if ($writeSnapshot) {
            $newSnapshot = fopen(self::SNAPSHOTS_PATH . $file, 'w');
            fwrite($newSnapshot, (string) $content);
            chmod(self::SNAPSHOTS_PATH . $file, 0777);
            fclose($newSnapshot);
            echo "\"Snapshot writen at '{$file}'. You can now relaunch the testsuite.\"";

            return;
        }

        $text = file_get_contents(self::SNAPSHOTS_PATH . $file);

        if (!str_contains((string) $content, $text)) {
            // HtmlDiffService
            $diff = $this->kernel
                ->getContainer()
                ->get('caxy.html_diff')
                ->diff($content, $text)
            ;
            $dir = self::SNAPSHOTS_DIFF_PATH;
            if (!file_exists($dir)) {
                mkdir($dir, 0777);
            }
            $path = $dir . $file;
            $newDiff = fopen($path, 'w');
            fwrite(
                $newDiff,
                $diff . '<link type="text/css" href="https://capco.dev/codes.css" rel="stylesheet">'
            );
            fclose($newDiff);

            $message = sprintf(
                "Snapshots didn't match ! Use 'open %s'. To regenerate snapshots, use 'fab local.qa.snapshots:emails'.",
                $path
            );

            echo $message;

            // Temporarily disable snapshot email testing, while we fix https://github.com/cap-collectif/platform/issues/13000
            // throw new \InvalidArgumentException($message);
        }
    }

    /**
     * @return Crawler
     */
    private function getCrawler(Message $message)
    {
        if (!class_exists('Symfony\Component\DomCrawler\Crawler')) {
            throw new \RuntimeException('Can\'t crawl HTML: Symfony DomCrawler component is missing from autoloading.');
        }

        return new Crawler($message->getPart('text/html')->getContent());
    }

    /**
     * @return null|Message
     */
    private function getCurrentMessage()
    {
        if (null === $this->currentMessage) {
            throw new \RuntimeException('No message selected');
        }

        return $this->currentMessage;
    }
}
