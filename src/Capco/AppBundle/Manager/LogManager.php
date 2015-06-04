<?php

namespace Capco\AppBundle\Manager;

use Doctrine\ORM\EntityManager;
use Gedmo\Loggable\Entity\LogEntry;
use Sonata\UserBundle\Entity\UserManager;
use Symfony\Component\Translation\TranslatorInterface;
use Capco\AppBundle\Entity\Synthesis\SynthesisDivision;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;

class LogManager
{
    protected $translator;
    protected $userManager;
    protected $em;

    public function __construct(TranslatorInterface $translator, UserManager $userManager, EntityManager $em)
    {
        $this->translator = $translator;
        $this->userManager = $userManager;
        $this->em = $em;
    }

    public function getSentencesForLog(LogEntry $log)
    {
        $sentences = array();
        $username = $this->userManager->findOneBy(array('slug' => $log->getUsername()));
        $elementName = $log->getObjectId();
        if ($log->getAction() === 'update') {
            if (array_key_exists('parent', $log->getData())) {
                $sentences[] = $this->makeSentence('move', $username, $elementName);
            }
            if (array_key_exists('enabled', $log->getData())) {
                if ($log->getData()['enabled'] === true) {
                    $sentences[] = $this->makeSentence('publish', $username, $elementName);
                } else {
                    $sentences[] = $this->makeSentence('unpublish', $username, $elementName);
                }
            }
            if (array_key_exists('archived', $log->getData()) && $log->getData()['archived'] === true) {
                $sentences[] = $this->makeSentence('archive', $username, $elementName);
            }
            if (array_key_exists('notation', $log->getData())) {
                $sentences[] = $this->makeSentence('note', $username, $elementName);
            }
            if (array_key_exists('title', $log->getData()) || array_key_exists('body', $log->getData())) {
                $sentences[] = $this->makeSentence('update', $username, $elementName);
            }
            return $sentences;
        }

        if ($log->getAction() === 'create' && $log->getObjectClass() === 'Capco\\AppBundle\\Entity\\Synthesis\\SynthesisDivision') {
            $division = $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisDivision')->find($log->getObjectId());
            $sentences[] = $this->makeSentence('divide', $username, $division->getOriginalElement()->getId());
            return $sentences;
        }

        $sentences[] = $this->makeSentence($log->getAction(), $username, $elementName);
        return $sentences;
    }

    public function getLogEntries($entity)
    {
        $logs = $this->em->getRepository('GedmoLoggable:LogEntry')->getLogEntries($entity);

        if ($entity instanceof SynthesisElement) {
            $divisions = $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisDivision')->findBy(array(
                'originalElement' => $entity
            ));
            foreach ($divisions as $div) {
                $logs = array_merge($logs, $this->getLogEntries($div));
            }
        }

        return $logs;
    }

    public function makeSentence($action, $username, $elementName)
    {
        $transBase = 'synthesis.logs.sentence.';
        return $this->translator->trans($transBase.$action, array(
            '%author%' => $username,
            '%element%' => $elementName,
        ), 'CapcoAppBundleSynthesis');
    }
}
