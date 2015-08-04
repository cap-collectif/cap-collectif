<?php

namespace spec\Capco\AppBundle\Synthesis\Handler;

use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisDivision;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Repository\Synthesis\SynthesisElementRepository;
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

    function it_can_get_all_elements_from_synthesis(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, ArrayCollection $collection, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'all';
        $synthesisElementRepo->getWith(array(
            'synthesis' => $synthesis
        ))->willReturn($collection)->shouldBeCalled();
        $this->getElementsFromSynthesisByType($synthesis, $type)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');

    }

    function it_can_get_new_elements_from_synthesis(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, ArrayCollection $collection, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'new';
        $synthesisElementRepo->getWith(array(
            'synthesis' => $synthesis,
            'archived' => false,
        ))->willReturn($collection)->shouldBeCalled();
        $this->getElementsFromSynthesisByType($synthesis, $type)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');

    }

    function it_can_get_unpublished_elements_from_synthesis(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, ArrayCollection $collection, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'unpublished';
        $synthesisElementRepo->getWith(array(
            'synthesis' => $synthesis,
            'archived' => true,
            'published' => false,
        ))->willReturn($collection)->shouldBeCalled();
        $this->getElementsFromSynthesisByType($synthesis, $type)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');

    }

    function it_can_get_published_elements_from_synthesis(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, ArrayCollection $collection, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'published';
        $synthesisElementRepo->getWith(array(
            'synthesis' => $synthesis,
            'archived' => true,
            'published' => true,
        ))->willReturn($collection)->shouldBeCalled();
        $this->getElementsFromSynthesisByType($synthesis, $type)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');

    }

    function it_can_get_archived_elements_from_synthesis(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, ArrayCollection $collection, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'archived';
        $synthesisElementRepo->getWith(array(
            'synthesis' => $synthesis,
            'archived' => true,
        ))->willReturn($collection)->shouldBeCalled();
        $this->getElementsFromSynthesisByType($synthesis, $type)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');

    }

    function it_can_get_elements__published_tree_from_synthesis(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, ArrayCollection $collection, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'tree_published';
        $synthesisElementRepo->getWith(array(
            'synthesis' => $synthesis,
            'parent' => null,
            'archived' => true,
            'published' => true,
        ))->willReturn($collection)->shouldBeCalled();
        $this->getElementsFromSynthesisByType($synthesis, $type)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');
    }

    function it_can_get_all_elements_tree_from_synthesis(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, ArrayCollection $collection, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'tree_all';
        $synthesisElementRepo->getWith(array(
            'synthesis' => $synthesis,
            'parent' => null,
        ))->willReturn($collection)->shouldBeCalled();
        $this->getElementsFromSynthesisByType($synthesis, $type)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');
    }

    function it_can_count_all_elements_from_synthesis_by_type(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'all';
        $synthesisElementRepo->countWith(array(
            'synthesis' => $synthesis
        ))->willReturn(2)->shouldBeCalled();
        $this->countElementsFromSynthesisByType($synthesis, $type)->shouldBeInteger();
    }

    function it_can_count_new_elements_from_synthesis_by_type(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'new';
        $synthesisElementRepo->countWith(array(
            'synthesis' => $synthesis,
            'archived' => false,
        ))->willReturn(1)->shouldBeCalled();
        $this->countElementsFromSynthesisByType($synthesis, $type)->shouldBeInteger();
    }

    function it_can_count_unpublished_elements_from_synthesis_by_type(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'unpublished';
        $synthesisElementRepo->countWith(array(
            'synthesis' => $synthesis,
            'archived' => true,
            'published' => false,
        ))->willReturn(0)->shouldBeCalled();
        $this->countElementsFromSynthesisByType($synthesis, $type)->shouldBeInteger();
    }

    function it_can_count_published_elements_from_synthesis_by_type(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'published';
        $synthesisElementRepo->countWith(array(
            'synthesis' => $synthesis,
            'archived' => true,
            'published' => true,
        ))->willReturn(0)->shouldBeCalled();
        $this->countElementsFromSynthesisByType($synthesis, $type)->shouldBeInteger();
    }

    function it_can_count_archived_elements_from_synthesis_by_type(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'archived';
        $synthesisElementRepo->countWith(array(
            'synthesis' => $synthesis,
            'archived' => true,
        ))->willReturn(5)->shouldBeCalled();
        $this->countElementsFromSynthesisByType($synthesis, $type)->shouldBeInteger();
    }

    function it_can_count_published_root_elements_from_synthesis_by_type(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'tree_published';
        $synthesisElementRepo->countWith(array(
            'synthesis' => $synthesis,
            'parent' => null,
            'archived' => true,
            'published' => true,
        ))->willReturn(3)->shouldBeCalled();
        $this->countElementsFromSynthesisByType($synthesis, $type)->shouldBeInteger();
    }

    function it_can_count_all_root_elements_from_synthesis_by_type(EntityManager $em, LogManager $logManager, SynthesisElementRepository $synthesisElementRepo, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->willReturn($synthesisElementRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);

        $type = 'tree_all';
        $synthesisElementRepo->countWith(array(
            'synthesis' => $synthesis,
            'parent' => null,
        ))->willReturn(3)->shouldBeCalled();
        $this->countElementsFromSynthesisByType($synthesis, $type)->shouldBeInteger();
    }

    function it_can_create_element_in_synthesis(EntityManager $em, LogManager $logManager, SynthesisElement $element, Synthesis $synthesis)
    {
        $element->setSynthesis($synthesis)->shouldBeCalled();
        $em->persist($element)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->beConstructedWith($em, $logManager);
        $this->createElementInSynthesis($element, $synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\SynthesisElement');
    }

    function it_can_update_element_in_synthesis(EntityManager $em, LogManager $logManager, SynthesisElement $element, Synthesis $synthesis)
    {
        $em->persist($element)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->beConstructedWith($em, $logManager);
        $this->updateElementInSynthesis($element, $synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\SynthesisElement');
    }

    function it_can_update_a_division_from_element_in_synthesis(EntityManager $em, LogManager $logManager, SynthesisDivision $division, SynthesisElement $element, Synthesis $synthesis, SynthesisElement $element)
    {
        $elements = new ArrayCollection([$element]);

        $division->getElements()->willReturn($elements)->shouldBeCalled();
        $em->persist($element)->shouldBeCalled();

        $em->persist($division)->shouldBeCalled();

        $this->beConstructedWith($em, $logManager);
        $this->updateDivisionFromElementInSynthesis($division, $element, $synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\SynthesisDivision');
    }

    function it_can_get_logs_for_element(EntityManager $em, LogManager $logManager, SynthesisElement $element, ArrayCollection $logs)
    {
        $logManager->getLogEntries($element)->willReturn($logs)->shouldBeCalled();
        $this->beConstructedWith($em, $logManager);
        $this->getLogsForElement($element)->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');
    }

}
