<?php

namespace spec\Capco\AppBundle\Synthesis\Handler;

use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Manager\LogManager;
use Capco\AppBundle\Synthesis\Extractor\ConsultationStepExtractor;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Prophecy\Argument as ProphecyArgument;

class SynthesisHandlerSpec extends ObjectBehavior
{
    function let(EntityManager $em, ConsultationStepExtractor $csExtractor, LogManager $logManager)
    {
        $this->beConstructedWith($em, $csExtractor, $logManager);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Synthesis\Handler\SynthesisHandler');
    }

    function it_can_get_all_syntheses(EntityManager $em, ConsultationStepExtractor $csExtractor, EntityRepository $repo, ArrayCollection $collection)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->willReturn($repo)->shouldBeCalled();
        $repo->findAll()->willReturn($collection)->shouldBeCalled();

        $this->beConstructedWith($em, $csExtractor);
        $this->getAll()->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');
    }

    function it_can_create_a_synthesis(EntityManager $em, ConsultationStepExtractor $csExtractor, Synthesis $synthesis)
    {
        $em->persist($synthesis)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->beConstructedWith($em, $csExtractor);
        $this->createSynthesis($synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');
    }

    function it_can_create_a_synthesis_from_consultation_step(EntityManager $em, ConsultationStepExtractor $csExtractor, Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        $synthesis->setConsultationStep($consultationStep)->shouldBeCalled();
        $synthesis->setSourceType('consultation_step')->shouldBeCalled();
        $synthesis->getSourceType()->willReturn('consultation_step');
        $synthesis->getConsultationStep()->willReturn($consultationStep);

        $this->beConstructedWith($em, $csExtractor);
        $this->createSynthesisFromConsultationStep($synthesis, $consultationStep)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');
    }

    function it_can_create_elements_from_source(EntityManager $em, ConsultationStepExtractor $csExtractor, Synthesis $synthesis, ConsultationStep $consultationStep, Synthesis $synthesisModified)
    {
        $this->beConstructedWith($em, $csExtractor);

        // Case where source is a consultation step
        $synthesis->getSourceType()->willReturn('consultation_step')->shouldBeCalled();
        $synthesis->getConsultationStep()->willReturn($consultationStep)->shouldBeCalled();
        $csExtractor->createElementsFromConsultationStep($synthesis, $consultationStep)->willReturn($synthesisModified)->shouldBeCalled();

        $this->createElementsFromSource($synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');

        // Case where source is not a consultation step
        $synthesis->getSourceType()->willReturn('none')->shouldBeCalled();

        $this->createElementsFromSource($synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');
    }

}
