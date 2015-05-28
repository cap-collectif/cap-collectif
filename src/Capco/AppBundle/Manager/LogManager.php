<?php

namespace Capco\AppBundle\Manager;

use Gedmo\Loggable\Entity\LogEntry;
use Symfony\Component\Translation\TranslatorInterface;

class LogManager
{
    protected $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function getSentencesForLog(LogEntry $log) {
        $actions = array();
        $transBase = 'synthesis.logs.sentence.';
        if ($log->getAction() === 'update') {
            if (array_key_exists('parent', $log->getData())) {
                $actions[] = 'move';
            }
            if (array_key_exists('enabled', $log->getData())) {
                if ($log->getData()['enabled'] === true) {
                    $actions[] = 'publish';
                } else {
                    $actions[] = 'unpublish';
                }
            }
            if (array_key_exists('archived', $log->getData()) && $log->getData()['archived'] === true) {
                $actions[] = 'archive';
            }
            if (array_key_exists('notation', $log->getData())) {
                $actions[] = 'note';
            }
            if (array_key_exists('title', $log->getData()) || array_key_exists('body', $log->getData())) {
                $actions[] = 'update';
            }
        } else {
            $actions[] = $log->getAction();
        }
        $sentences = array();
        foreach ($actions as $action) {
            $sentences[] = $this->translator->trans($transBase.$action, array(
                '%author%' => $log->getUsername(),
                '%element%' => $log->getObjectId(),
            ), 'CapcoAppBundleSynthesis');
        }
        return $sentences;
    }
}
