<?php

namespace Capco\AppBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use Gedmo\Loggable\Entity\LogEntry;
use Symfony\Component\Translation\TranslatorInterface;

class LogManager
{
    protected $translator;
    protected $userManager;
    protected $em;

    public function __construct(
        TranslatorInterface $translator,
        UserManagerInterface $userManager,
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
        $logData = $log->getData();
        if ('update' === $log->getAction()) {
            if (isset($logData['parent'])) {
                $sentences[] = $this->makeSentence('move', $username);
            }
            if (isset($logData['published'])) {
                if (true === $log->getData()['published']) {
                    $sentences[] = $this->makeSentence('publish', $username);
                } else {
                    $sentences[] = $this->makeSentence('unpublish', $username);
                }
            }
            if (isset($logData['archived']) && true === $logData['archived']) {
                $sentences[] = $this->makeSentence('archive', $username);
            }
            if (isset($logData['notation'])) {
                $sentences[] = $this->makeSentence('note', $username);
            }
            if (isset($logData['comment'])) {
                $sentences[] = $this->makeSentence('comment', $username);
            }
            if (isset($logData['title']) || isset($logData['body'])) {
                $sentences[] = $this->makeSentence('update', $username);
            }
            if (isset($logData['division'])) {
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
