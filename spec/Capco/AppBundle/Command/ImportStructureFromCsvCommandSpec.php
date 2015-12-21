<?php

namespace spec\Capco\AppBundle\Command;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Capco\AppBundle\Entity\OpinionType;

class ImportStructureFromCsvCommandSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Command\ImportStructureFromCsvCommand');
    }

    function it_should_get_object_depending_on_type(OpinionType $ot1, OpinionType $ot2, OpinionType $ot3)
    {
        $ot1->getTitle()->willReturn('Titre 5');
        $ot1->getChildren()->willReturn([$ot2, $ot3]);

        $ot2->getTitle()->willReturn('Chapitre 1');
        $ot2->getChildren()->willReturn([]);

        $ot3->getTitle()->willReturn('Chapitre 2');
        $ot3->getChildren()->willReturn([]);

        $this->findOpinionTypeByPath('Titre 5|Chapitre 1', [$ot1, $ot2, $ot3])->shouldReturn($ot2);
        $this->findOpinionTypeByPath('Titre 5|Chapitre 2', [$ot1, $ot2, $ot3])->shouldReturn($ot3);
        // $this->findOpinionTypeByPath('Chapitre 2', [$ot1, $ot2, $ot3])->shouldReturn(null);
    }

}
