<?php

namespace Capco\AppBundle\GraphQL\Mutation\OpinionAdmin;

use Capco\AppBundle\Entity\Answer;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Capco\AppBundle\Enum\OpinionAdminErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Applies the fields of the former Sonata opinion form (OpinionAdmin::configureFormFields()).
 */
trait OpinionAdminInputTrait
{
    private function applyInput(
        Opinion $opinion,
        Argument $input,
        UserRepository $userRepository,
        ValidatorInterface $validator
    ): ?string {
        // Validate an isolated graph: a later mutation in the same request may flush managed entities.
        $candidate = clone $opinion;
        $candidate->setAppendices(new ArrayCollection());
        foreach ($opinion->getAppendices() as $appendix) {
            $candidate->addAppendice(clone $appendix);
        }
        $candidate->setAnswer($opinion->getAnswer() ? clone $opinion->getAnswer() : null);

        $errorCode = $this->populateOpinion($candidate, $input, $userRepository);
        if (null !== $errorCode) {
            return $errorCode;
        }

        $answer = $candidate->getAnswer();
        if (
            \count($validator->validate($candidate)) > 0
            || ($answer && \count($validator->validate($answer)) > 0)
        ) {
            return OpinionAdminErrorCode::INVALID_DATA;
        }

        // Apply validated input to the original graph, preserving managed answer and appendix identities.
        return $this->populateOpinion($opinion, $input, $userRepository);
    }

    private function populateOpinion(
        Opinion $opinion,
        Argument $input,
        UserRepository $userRepository
    ): ?string {
        $author = $this->findUser($input->offsetGet('author'), $userRepository);
        $title = trim((string) $input->offsetGet('title'));
        $body = (string) $input->offsetGet('body');
        if (!$author) {
            return OpinionAdminErrorCode::AUTHOR_NOT_FOUND;
        }
        if ('' === $title || self::isBodyEmpty($body)) {
            return OpinionAdminErrorCode::INVALID_DATA;
        }

        $opinion
            ->setTitle($title)
            ->setBody($body)
            // The back office edits the content with Jodit.
            ->setBodyUsingJoditWysiwyg(true)
            ->setAuthor($author)
            ->setPosition($input->offsetGet('position'))
        ;
        $opinion->setPinned((bool) $input->offsetGet('pinned'));
        // Clearing the status also clears the reason and the date, as in Sonata.
        $opinion->setTrashedStatus($input->offsetGet('trashedStatus'));
        if ($opinion->getTrashedStatus()) {
            $opinion->setTrashedReason($input->offsetGet('trashedReason') ?: null);
        }

        $this->applyAppendices($opinion, $input->offsetGet('appendices') ?? []);

        return $this->applyAnswer($opinion, $input->offsetGet('answer'), $userRepository);
    }

    private function findUser(?string $id, UserRepository $userRepository): ?User
    {
        if (null === $id || '' === $id) {
            return null;
        }
        $user = $userRepository->find(GlobalIdResolver::getDecodedId($id, true));

        return $user instanceof User ? $user : null;
    }

    /**
     * One appendix per appendix type of the opinion type, in the order of the opinion type, like
     * OpinionController::updateAppendicesForOpinion(). Appendices of another type are removed.
     *
     * @param iterable<array{appendixTypeId: string, body?: ?string}> $appendicesInput
     */
    private function applyAppendices(Opinion $opinion, iterable $appendicesInput): void
    {
        $bodies = [];
        foreach ($appendicesInput as $appendixInput) {
            $bodies[(string) $appendixInput['appendixTypeId']] = $appendixInput['body'] ?? null;
        }

        $appendixTypes = $opinion->getOpinionType()?->getAppendixTypes()?->toArray() ?? [];
        usort(
            $appendixTypes,
            fn (OpinionTypeAppendixType $first, OpinionTypeAppendixType $second) => (int) $first->getPosition() <=> (int) $second->getPosition()
        );

        $appendices = new ArrayCollection();
        foreach ($appendixTypes as $opinionTypeAppendixType) {
            $appendixType = $opinionTypeAppendixType->getAppendixType();
            $appendix = $opinion->getAppendices()->filter(
                fn (OpinionAppendix $existing) => $existing->getAppendixType() === $appendixType
            )->first() ?: (new OpinionAppendix())->setAppendixType($appendixType);

            if (\array_key_exists((string) $appendixType->getId(), $bodies)) {
                $body = $bodies[(string) $appendixType->getId()];
                $appendix->setBody(self::isBodyEmpty($body) ? null : $body);
                $appendix->setBodyUsingJoditWysiwyg(true);
            }
            $appendices->add($appendix);
        }

        // The "appendices" association has orphanRemoval: appendices left out of the collection are deleted.
        foreach ($opinion->getAppendices()->toArray() as $existing) {
            if (!$appendices->contains($existing)) {
                $opinion->removeAppendice($existing);
            }
        }
        foreach ($appendices as $appendix) {
            $opinion->addAppendice($appendix);
        }
    }

    /**
     * @param null|array{title?: ?string, body: string, author: string} $answerInput
     */
    private function applyAnswer(Opinion $opinion, ?array $answerInput, UserRepository $userRepository): ?string
    {
        if (null === $answerInput) {
            // The "answer" association has orphanRemoval: the former answer is deleted.
            $opinion->setAnswer(null);

            return null;
        }

        // Required, as in Sonata: Answer has the HasAuthor constraint
        $answerAuthor = $this->findUser($answerInput['author'] ?? null, $userRepository);
        if (!$answerAuthor) {
            return OpinionAdminErrorCode::AUTHOR_NOT_FOUND;
        }
        if (self::isBodyEmpty($answerInput['body'])) {
            return OpinionAdminErrorCode::INVALID_DATA;
        }

        $answer = $opinion->getAnswer() ?? new Answer();
        $answer
            ->setTitle(trim((string) ($answerInput['title'] ?? '')) ?: null)
            ->setBody($answerInput['body'])
            ->setAuthor($answerAuthor)
        ;
        $opinion->setAnswer($answer);

        return null;
    }

    private static function isBodyEmpty(?string $body): bool
    {
        // Media-only contents are not empty even though they have no text.
        return '' === trim(html_entity_decode(strip_tags((string) $body, '<img><iframe><video><audio>')), " \t\n\r\0\x0B\u{00A0}");
    }
}
