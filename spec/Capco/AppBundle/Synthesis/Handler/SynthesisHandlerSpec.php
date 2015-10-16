<?php

namespace spec\Capco\AppBundle\Synthesis\Handler;

use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Synthesis\Extractor\ConsultationStepExtractor;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Prophecy\Argument as ProphecyArgument;

class SynthesisHandlerSpec extends ObjectBehavior
{
    function let(EntityManager $em, ConsultationStepExtractor $csExtractor)
    {
        $this->beConstructedWith($em, $csExtractor);
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
        $this->getAllSyntheses()->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');
    }

    function it_can_create_a_synthesis(EntityManager $em, ConsultationStepExtractor $csExtractor, Synthesis $synthesis)
    {
        $em->persist($synthesis)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->beConstructedWith($em, $csExtractor);
        $this->createSynthesis($synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');
    }

    function it_can_update_a_synthesis(EntityManager $em, ConsultationStepExtractor $csExtractor, Synthesis $synthesis)
    {
        $em->persist($synthesis)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->beConstructedWith($em, $csExtractor);
        $this->updateSynthesis($synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');
    }

    function it_can_get_a_synthesis(EntityManager $em, ConsultationStepExtractor $csExtractor, EntityRepository $repo, $id, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->willReturn($repo)->shouldBeCalled();
        $repo->find($id)->willReturn($synthesis)->shouldBeCalled();

        $this->beConstructedWith($em, $csExtractor);
        $this->getSynthesis($id)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');
    }

    function it_can_get_an_updated_synthesis(EntityManager $em, ConsultationStepExtractor $csExtractor, EntityRepository $repo, $id, Synthesis $synthesis)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->willReturn($repo)->shouldBeCalled();
        $repo->find($id)->willReturn($synthesis)->shouldBeCalled();

        $this->beConstructedWith($em, $csExtractor);
        $this->getUpdatedSynthesis($id)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');
    }

    function it_can_create_a_synthesis_from_consultation_step(EntityManager $em, ConsultationStepExtractor $csExtractor, Synthesis $synthesis, ConsultationStep $consultationStep, Synthesis $updatedSynthesis)
    {
        $synthesis->setConsultationStep($consultationStep)->shouldBeCalled();
        $synthesis->setSourceType('consultation_step')->shouldBeCalled();
        $synthesis->getConsultationStep()->willReturn($consultationStep)->shouldBeCalled();
        $synthesis->getSourceType()->willReturn('consultation_step')->shouldBeCalled();
        $csExtractor->createOrUpdateElementsFromConsultationStep($synthesis, $consultationStep)->willReturn($updatedSynthesis)->shouldBeCalled();

        $this->beConstructedWith($em, $csExtractor);
        $this->createSynthesisFromConsultationStep($synthesis, $consultationStep)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');
    }

    function it_can_create_or_update_elements_from_source(EntityManager $em, ConsultationStepExtractor $csExtractor, Synthesis $synthesis, ConsultationStep $consultationStep, Synthesis $synthesisModified)
    {
        $this->beConstructedWith($em, $csExtractor);

        // Case where source is a consultation step
        $synthesis->getSourceType()->willReturn('consultation_step')->shouldBeCalled();
        $synthesis->getConsultationStep()->willReturn($consultationStep)->shouldBeCalled();
        $csExtractor->createOrUpdateElementsFromConsultationStep($synthesis, $consultationStep)->willReturn($synthesisModified)->shouldBeCalled();

        $this->createOrUpdateElementsFromSource($synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');

        // Case where source is not a consultation step
        $synthesis->getSourceType()->willReturn('none')->shouldBeCalled();

        $this->createOrUpdateElementsFromSource($synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');
    }

}
