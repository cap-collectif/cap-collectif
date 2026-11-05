<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventReview;
use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Model\TranslationInterface;
use Doctrine\ORM\EntityManagerInterface;

class MediaPublicationPolicy
{
    public function __construct(private readonly EntityManagerInterface $em) {}

    public function fieldVisibility(object $entity, string $field): ?bool
    {
        $visibility = $this->isPublic($entity);
        if (false === $visibility) {
            return false;
        }
        if ($entity instanceof Proposal) {
            if ('body' === $field && !$entity->getProposalForm()->getUsingDescription()) {
                return false;
            }

            return \in_array($field, ['body', 'media'], true) ? $visibility : null;
        }
        if ($entity instanceof Project) {
            return 'cover' === $field ? $visibility : null;
        }
        if ($entity instanceof AbstractResponse) {
            if ('value' === $field && AbstractQuestion::QUESTION_TYPE_EDITOR !== $entity->getQuestion()->getType()) {
                return null;
            }

            return \in_array($field, ['value', 'medias'], true) ? $visibility : null;
        }
        if ($entity instanceof AbstractStep) {
            return \in_array($field, ['body', 'footer', 'debateContent', 'votesHelpText'], true) ? $visibility : null;
        }
        if ($entity instanceof TranslationInterface) {
            return \in_array($field, ['body'], true) ? $visibility : null;
        }

        return \in_array($field, ['body', 'media', 'cover'], true) ? $visibility : null;
    }

    /** @return iterable<object> */
    public function descendants(object $parent): iterable
    {
        if ($parent instanceof EventReview) {
            foreach ($this->em->getRepository(Event::class)->findBy(['review' => $parent]) as $event) {
                yield $event;

                yield from $this->descendants($event);
            }
        }
        if (method_exists($parent, 'getTranslations')) {
            yield from $parent->getTranslations();
        }
        if ($parent instanceof ProjectAbstractStep && $parent->getStep()) {
            yield $parent->getStep();

            yield from $this->descendants($parent->getStep());
        }
        if ($parent instanceof Project) {
            foreach ($parent->getSteps() as $link) {
                yield $link->getStep();

                yield from $this->descendants($link->getStep());
            }
        } elseif ($parent instanceof CollectStep && $parent->getProposalForm()) {
            yield from $this->descendants($parent->getProposalForm());
        } elseif ($parent instanceof ProposalForm) {
            foreach ($parent->getProposals() as $proposal) {
                yield $proposal;

                yield from $proposal->getResponses();
            }
        } elseif ($parent instanceof AbstractQuestion) {
            yield from $parent->getResponses();
        } elseif ($parent instanceof Proposal) {
            yield from $parent->getResponses();
        } elseif ($parent instanceof Selection && $parent->getProposal()) {
            yield $parent->getProposal();

            yield from $parent->getProposal()->getResponses();
        }
    }

    /** Null means the historical command must not guess the visibility. */
    public function isPublic(object $entity): ?bool
    {
        if ($entity instanceof TranslationInterface) {
            return $this->isPublic($entity->getTranslatable());
        }
        if ($entity instanceof AbstractResponse) {
            if ($entity->getReply() || $entity->getAnalysis() || $entity->getProposalEvaluation()
                || $entity->getQuestion()->isPrivate() || $entity->getQuestion()->getHidden()) {
                return false;
            }

            return $entity->getProposal() ? $this->isPublic($entity->getProposal()) : false;
        }
        if ($entity instanceof Proposal) {
            return $entity->isPublished() && !$entity->isDraft() && !$entity->isTrashed() && !$entity->isDeleted()
                && $entity->isVisible() && $entity->getStep() && $entity->getStep()->getIsEnabled()
                && $entity->getProject()?->isPublic();
        }
        if ($entity instanceof Project) {
            return $entity->isPublic();
        }
        if ($entity instanceof AbstractStep) {
            return $entity->getIsEnabled() && $entity->getProject()?->isPublic();
        }
        if ($entity instanceof Page || $entity instanceof Theme) {
            return $entity->getIsEnabled();
        }
        if ($entity instanceof Post) {
            return $entity->isPublic();
        }
        if ($entity instanceof Event) {
            return $entity->isEnabledOrApproved();
        }

        return null;
    }
}
