<?php

namespace spec\Capco\AppBundle\Synthesis\Extractor;

use Capco\AppBundle\Entity\ConsultationType;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Synthesis\SynthesisDivision;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Resolver\OpinionTypesResolver;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManager;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Doctrine\Common\Collections\ArrayCollection;
use Prophecy\Argument as ProphecyArgument;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Bundle\FrameworkBundle\Routing\Router;

class ConsultationStepExtractorSpec extends ObjectBehavior
{
    function let(EntityManager $em, TranslatorInterface $translator, Router $router, OpinionTypesResolver $opinionTypesResolver)
    {
        $this->beConstructedWith($em, $translator, $router, $opinionTypesResolver);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Synthesis\Extractor\ConsultationStepExtractor');
    }

    function it_can_create_or_update_elements_from_consultation_step(EntityManager $em, OpinionRepository $repo, Synthesis $synthesis, ConsultationStep $consultationStep, OpinionTypesResolver $opinionTypesResolver)
    {
        // Objects can not be mocked because we need to call get_class() method on them

        $opinionType = new OpinionType();

        $opinion1 = new Opinion();
        $opinion1->setId(1);
        $opinion1->setOpinionType($opinionType);

        $argument1 = new Argument();
        $argument1->setId(421);
        $argument1->setOpinion($opinion1);
        $opinion1->addArgument($argument1);

        $argument2 = new Argument();
        $argument2->setId(422);
        $argument2->setOpinion($opinion1);
        $opinion1->addArgument($argument2);

        $opinion2 = new Opinion();
        $opinion2->setId(2);
        $opinion2->setOpinionType($opinionType);

        $argument3 = new Argument();
        $argument3->setId(423);
        $argument3->setOpinion($opinion2);
        $opinion2->addArgument($argument3);

        $argument4 = new Argument();
        $argument4->setId(424);
        $argument4->setOpinion($opinion2);
        $opinion2->addArgument($argument4);

        // Element0 is linked to opinionType
        $element0 = new SynthesisElement();
        $element0->setLinkedDataId(1);
        $element0->setLinkedDataClass('Capco\AppBundle\Entity\OpinionType');

        // Element 1 is linked to opinion 1
        $element1 = new SynthesisElement();
        $element1->setLinkedDataId(1);
        $element1->setLinkedDataClass('Capco\AppBundle\Entity\Opinion');

        // Element 2 is linked to argument 2
        $element2 = new SynthesisElement();
        $element2->setLinkedDataId(422);
        $element2->setLinkedDataClass('Capco\AppBundle\Entity\Argument');

        // Element 3 is linked to argument 4
        $element3 = new SynthesisElement();
        $element3->setLinkedDataId(424);
        $element3->setLinkedDataClass('Capco\AppBundle\Entity\Argument');

        $currentElements = new ArrayCollection([$element0, $element1, $element2, $element3]);
        $opinions = new ArrayCollection([$opinion1, $opinion2]);

        $synthesis->getElements()->willReturn($currentElements)->shouldBeCalled();
        $consultationType = new ConsultationType();
        $consultationStep->getConsultationType()->willReturn($consultationType)->shouldBeCalled();

        $em->flush()->shouldBeCalled();

        $synthesis = $this->createOrUpdateElementsFromConsultationStep($synthesis, $consultationStep)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');

        expect(6 === count($synthesis->getElements()));

    }

    function it_can_tell_if_element_is_related_to_object(SynthesisElement $element)
    {
        // Can't mock opinion because we need to call get_class() method on it
        $opinion = new Opinion();
        $opinion->setId(42);

        // Related element (same class, same id)
        $element->getLinkedDataClass()->willReturn('Capco\AppBundle\Entity\Opinion')->shouldBeCalled();
        $element->getLinkedDataId()->willReturn(42)->shouldBeCalled();
        $this->isElementRelated($element, $opinion)->shouldReturn(true);

        // Not related (different id)
        $element->getLinkedDataClass()->willReturn('Capco\AppBundle\Entity\Opinion')->shouldBeCalled();
        $element->getLinkedDataId()->willReturn(51)->shouldBeCalled();
        $this->isElementRelated($element, $opinion)->shouldReturn(false);

        // Not related (different class)
        $element->getLinkedDataClass()->willReturn('Capco\AppBundle\Entity\Synthesis\Test')->shouldBeCalled();
        $element->getLinkedDataId()->willReturn(42)->shouldBeCalled();
        $this->isElementRelated($element, $opinion)->shouldReturn(false);

        // Not related (both different)
        $element->getLinkedDataClass()->willReturn('Capco\AppBundle\Entity\Synthesis\Test')->shouldBeCalled();
        $element->getLinkedDataId()->willReturn(51)->shouldBeCalled();
        $this->isElementRelated($element, $opinion)->shouldReturn(false);
    }

    function it_can_tell_if_element_is_outdated(SynthesisElement $element, Opinion $opinion)
    {
        $now = new \DateTime();
        $before = (new \DateTime())->modify('-10 days');

        // Element before object (element outdated)
        $element->getLinkedDataLastUpdate()->willReturn($before)->shouldBeCalled();
        $opinion->getUpdatedAt()->willReturn($now)->shouldBeCalled();
        $this->elementIsOutdated($element, $opinion)->shouldReturn(true);

        // Object before element
        $element->getLinkedDataLastUpdate()->willReturn($now)->shouldBeCalled();
        $opinion->getUpdatedAt()->willReturn($before)->shouldBeCalled();
        $this->elementIsOutdated($element, $opinion)->shouldReturn(false);

        // Same dates
        $element->getLinkedDataLastUpdate()->willReturn($now)->shouldBeCalled();
        $opinion->getUpdatedAt()->willReturn($now)->shouldBeCalled();
        $this->elementIsOutdated($element, $opinion)->shouldReturn(false);
    }

    function it_can_update_an_element_from_an_object(SynthesisElement $element, SynthesisDivision $division, User $author, EntityManager $em, TranslatorInterface $translator, Router $router, Opinion $object)
    {
        $date = new \DateTime();
        $object->getTitle()->willReturn('test')->shouldBeCalled();
        $object->getBody()->willReturn('blabla')->shouldBeCalled();
        $object->getAuthor()->willReturn($author)->shouldBeCalled();
        $object->getUpdatedAt()->willReturn($date)->shouldBeCalled();
        $object->getVoteCountOk()->willReturn(25)->shouldBeCalled();
        $object->getVoteCountNok()->willReturn(25)->shouldBeCalled();
        $object->getVoteCountMitige()->willReturn(25)->shouldBeCalled();

        $element->setLinkedDataLastUpdate($date)->shouldBeCalled();
        $element->getOriginalDivision()->willReturn(null)->shouldBeCalled();
        $element->setDeletedAt(null)->shouldBeCalled();
        $element->setArchived(false)->shouldBeCalled();
        $element->setPublished(false)->shouldBeCalled();

        $element->setAuthor($author)->shouldBeCalled();
        $element->setTitle('test')->shouldBeCalled();
        $element->setBody('blabla')->shouldBeCalled();
        $element->setVotes([-1 => 25, 0 => 25, 1 => 25])->shouldBeCalled();

        $this->updateElementFrom($element, $object)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\SynthesisElement');
    }

}
