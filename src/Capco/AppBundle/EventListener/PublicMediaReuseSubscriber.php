<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Model\TranslationInterface;
use Capco\AppBundle\Service\MediaAccessResolver;
use Capco\AppBundle\Service\MediaDocumentReferences;
use Capco\AppBundle\Service\MediaPublicationPolicy;
use Doctrine\ORM\Event\OnFlushEventArgs;
use GraphQL\Error\Error;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class PublicMediaReuseSubscriber
{
    public function __construct(private readonly MediaDocumentReferences $documents, private readonly MediaPublicationPolicy $policy, private readonly MediaAccessResolver $access) {}

    public function onFlush(OnFlushEventArgs $event): void
    {
        $em = $event->getEntityManager();
        $uow = $em->getUnitOfWork();
        $insertions = $uow->getScheduledEntityInsertions();
        $insertedIds = array_fill_keys(array_map(\spl_object_id(...), $insertions), true);
        $validated = [];
        $entities = [...$insertions, ...$uow->getScheduledEntityUpdates()];
        $collectionOwners = [];
        foreach ($uow->getScheduledCollectionUpdates() as $collection) {
            $owner = $collection->getOwner();
            $entities[] = $owner;
            $collectionOwners[spl_object_id($owner)] = true;
        }
        foreach ($entities as $entity) {
            $key = spl_object_id($entity);
            if (isset($validated[$key])) {
                continue;
            }
            $changed = array_keys($uow->getEntityChangeSet($entity));
            $transition = (bool) array_intersect($changed, [
                'visibility', 'private', 'hidden', 'isEnabled', 'enabled', 'draft',
                'publishedAt', 'isPublished', 'trashedAt', 'deletedAt', 'status',
                'proposalForm', 'usingDescription', 'step', 'project', 'review',
                'proposal', 'question', 'reply', 'analysis', 'proposalEvaluation',
            ]);
            $allFields = $transition || isset($insertedIds[$key]) || isset($collectionOwners[spl_object_id($entity)]);
            $this->validate($entity, $event, $allFields ? null : $changed);
            if ($allFields) {
                $validated[$key] = true;
                foreach ($this->policy->descendants($entity) as $descendant) {
                    $descendantId = spl_object_id($descendant);
                    if (!isset($validated[$descendantId])) {
                        $this->validate($descendant, $event);
                        $validated[$descendantId] = true;
                    }
                }
            }
        }
    }

    /** @param null|list<string> $changedFields */
    private function validate(object $entity, OnFlushEventArgs $event, ?array $changedFields = null): void
    {
        $owner = $entity instanceof TranslationInterface ? $entity->getTranslatable() : $entity;
        $scheduled = $owner instanceof Post && $owner->getIsPublished();
        if (false === $this->policy->isPublic($entity) && !$scheduled) {
            return;
        }
        foreach ($this->documents->references($entity, $changedFields) as $field => $medias) {
            if (false === $this->policy->fieldVisibility($entity, $field) && !$scheduled) {
                continue;
            }
            foreach ($medias as $media) {
                if ($this->access->isPrivate($media)) {
                    // Discard rejected managed changes so another mutation cannot flush them.
                    $event->getEntityManager()->clear();

                    throw new Error('PRIVATE_MEDIA_REUSE_DENIED: ' . $field . ' (' . $media->getId() . '). Upload a separate public file.', null, null, [], null, new UserError('Private media cannot be published.'), [
                        'code' => 'MEDIA_REUSE_DENIED',
                        'field' => $field,
                        'questionId' => $entity instanceof AbstractResponse ? GlobalId::toGlobalId('Question', $entity->getQuestion()->getId()) : null,
                        'mediaReference' => $media->getProviderReference(),
                    ]);
                }
            }
        }
    }
}
