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

    function it_should_find_opinion_type_by_path(OpinionType $ot1, OpinionType $ot2, OpinionType $ot3)
    {
        $ot1->getTitle()->willReturn('Titre 5');
        $ot1->getChildren()->willReturn([$ot2, $ot3]);

        $ot2->getTitle()->willReturn('Chapitre 1');
        $ot3->getTitle()->willReturn('Chapitre 2');

        $this->findOpinionTypeByPath('Titre 5', [$ot1])->shouldReturn($ot1);
        $this->findOpinionTypeByPath('Titre 5|Chapitre 1', [$ot1])->shouldReturn($ot2);
        $this->findOpinionTypeByPath('Titre 5|Chapitre 2', [$ot1])->shouldReturn($ot3);

        $this->shouldThrow(new \Exception('Unknown opinion title: "Chapitre 2"', 1))
             ->duringFindOpinionTypeByPath('Chapitre 2', [$ot1]);
    }

}
