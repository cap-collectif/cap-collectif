<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Synthesis\SynthesisLogItem;
use Symfony\Component\Translation\TranslatorInterface;

class LogManager
{
    protected $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function getSentenceForLog(SynthesisLogItem $log) {
        $transId = 'synthesis.logs.sentence.'.$log->getAction();
        return $this->translator->trans($transId, array(
            '%author%' => $log->getAuthor()->getUsername(),
            '%element%' => $log->getElementTitle(),
        ), 'CapcoAppBundleSynthesis');
    }
}
