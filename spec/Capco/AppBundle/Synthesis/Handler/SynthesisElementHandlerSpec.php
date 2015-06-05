<?php

namespace spec\Capco\AppBundle\Synthesis\Handler;

use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisDivision;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Manager\LogManager;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Prophecy\Argument as ProphecyArgument;

class SynthesisElementHandlerSpec extends ObjectBehavior
{
    function let(EntityManager $em, LogManager $logManager)
    {
        $this->beConstructedWith($em, $logManager);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Synthesis\Handler\SynthesisElementHandler');
    }

    function it_can_get_all_elements_from_synthesis(EntityManager $em, LogManager $logManager, EntityRepository $repo, ArrayCollection $collection, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($repo)->shouldBeCalled();
        $repo->findBy(array(
            'synthesis' => $synthesis
        ))->willReturn($collection)->shouldBeCalled();

        $this->beConstructedWith($em, $logManager);
        $this->getAllElementsFromSynthesis($synthesis)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');
    }

    function it_can_get_new_elements_from_synthesis(EntityManager $em, LogManager $logManager, EntityRepository $repo, ArrayCollection $collection, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($repo)->shouldBeCalled();
        $repo->findBy(array(
            'synthesis' => $synthesis,
            'archived' => false,
        ))->willReturn($collection)->shouldBeCalled();

        $this->beConstructedWith($em, $logManager);
        $this->getNewElementsFromSynthesis($synthesis)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');
    }

    function it_can_create_or_update_element_in_synthesis(EntityManager $em, LogManager $logManager, SynthesisElement $element, Synthesis $synthesis)
    {
        $element->setSynthesis($synthesis)->shouldBeCalled();
        $em->persist($element)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->beConstructedWith($em, $logManager);
        $this->createOrUpdateElementInSynthesis($element, $synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\SynthesisElement');
    }

    function it_can_create_a_division_from_element_in_synthesis(EntityManager $em, LogManager $logManager, SynthesisDivision $division, SynthesisElement $element, Synthesis $synthesis, SynthesisElement $element)
    {
        $elements = new ArrayCollection([$element]);

        $division->getElements()->willReturn($elements)->shouldBeCalled();
        $em->persist($element)->shouldBeCalled();

        $division->setOriginalElement($element)->shouldBeCalled();
        $em->persist($division)->shouldBeCalled();
        $em->remove($element)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->beConstructedWith($em, $logManager);
        $this->createDivisionFromElementInSynthesis($division, $element, $synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\SynthesisDivision');
    }

    function it_can_get_logs_for_element(EntityManager $em, LogManager $logManager, SynthesisElement $element, ArrayCollection $logs)
    {
        $logManager->getLogEntries($element)->willReturn($logs)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);
        $this->getLogsForElement($element)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');
    }

}
