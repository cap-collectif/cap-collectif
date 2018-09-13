<?php

namespace Capco\AppBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use Gedmo\Loggable\Entity\LogEntry;
use Sonata\UserBundle\Entity\UserManager;
use Symfony\Component\Translation\TranslatorInterface;

class LogManager
{
    protected $translator;
    protected $userManager;
    protected $em;

    public function __construct(
        TranslatorInterface $translator,
        UserManager $userManager,
        EntityManagerInterface $em
    ) {
        $this->translator = $translator;
        $this->userManager = $userManager;
        $this->em = $em;
    }

    public function getSentencesForLog(LogEntry $log)
    {
        $sentences = [];
        $username = $log->getUsername()
            ? $this->userManager->findOneBy(['slug' => $log->getUsername()])
            : null;
        // Update actions
        if ('update' === $log->getAction()) {
            if (array_key_exists('parent', $log->getData())) {
                $sentences[] = $this->makeSentence('move', $username);
            }
            if (array_key_exists('published', $log->getData())) {
                if (true === $log->getData()['published']) {
                    $sentences[] = $this->makeSentence('publish', $username);
                } else {
                    $sentences[] = $this->makeSentence('unpublish', $username);
                }
            }
            if (
                array_key_exists('archived', $log->getData()) &&
                true === $log->getData()['archived']
            ) {
                $sentences[] = $this->makeSentence('archive', $username);
            }
            if (array_key_exists('notation', $log->getData())) {
                $sentences[] = $this->makeSentence('note', $username);
            }
            if (array_key_exists('comment', $log->getData())) {
                $sentences[] = $this->makeSentence('comment', $username);
            }
            if (
                array_key_exists('title', $log->getData()) ||
                array_key_exists('body', $log->getData())
            ) {
                $sentences[] = $this->makeSentence('update', $username);
            }
            if (array_key_exists('division', $log->getData())) {
                $sentences[] = $this->makeSentence('divide', $username);
            }

            return $sentences;
        }

        // Delete or create actions
        $sentences[] = $this->makeSentence($log->getAction(), $username);

        return $sentences;
    }

    public function getLogEntries($entity)
    {
        return $this->em->getRepository('GedmoLoggable:LogEntry')->getLogEntries($entity);
    }

    public function makeSentence($action, $username)
    {
        $transBase = 'synthesis.logs.sentence.';

        return $this->translator->trans(
            $transBase . $action,
            [
                '%author%' => $username,
            ],
            'CapcoAppBundle'
        );
    }
}
