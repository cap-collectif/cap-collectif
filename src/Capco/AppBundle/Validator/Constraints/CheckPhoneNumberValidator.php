<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProposalSelectionSmsVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckPhoneNumberValidator extends ConstraintValidator
{
    private UserRepository $userRepository;
    private Security $security;
    private GlobalIdResolver $globalIdResolver;
    private ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository;
    private ProposalSelectionVoteRepository $proposalSelectionVoteRepository;

    public function __construct(
        UserRepository $userRepository,
        Security $security,
        GlobalIdResolver $globalIdResolver,
        ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository
    ) {
        $this->userRepository = $userRepository;
        $this->security = $security;
        $this->globalIdResolver = $globalIdResolver;
        $this->proposalSelectionSmsVoteRepository = $proposalSelectionSmsVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
    }

    public function validate($value, Constraint $constraint): void
    {
        if (!$value) {
            return;
        }
        $this->validateNumberLength($value, $constraint);
        $this->validateMobileNumber($value, $constraint);
        $this->checkAlreadyUsed($value, $constraint);
    }

    private function validateNumberLength(string $phone, Constraint $constraint): void
    {
        $phoneMaxLength = 12; // +33 and 9 digits
        if (\strlen($phone) !== $phoneMaxLength) {
            $this->context->buildViolation($constraint->invalidLength)->addViolation();
        }
    }

    private function validateMobileNumber(string $phone, Constraint $constraint): void
    {
        $prefix = substr($phone, 0, 4);
        if ('+336' !== $prefix && '+337' !== $prefix) {
            $this->context->buildViolation($constraint->mobileNumber)->addViolation();
        }
    }

    private function checkAlreadyUsed(string $phone, Constraint $constraint): void
    {
        $currentUser = $this->security->getUser();
        $user = $this->userRepository->findOneBy(['phone' => $phone, 'phoneConfirmed' => true]);

        $stepId = $constraint->stepId;
        $step = $stepId ? $this->globalIdResolver->resolve($stepId) : null;
        if ($step instanceof SelectionStep) {
            $anonUserAlreadyVotedInThisStep = $this->proposalSelectionSmsVoteRepository->findBy(['phone' => $phone, 'selectionStep' => $step]);
            $userAlreadyVotedInThisStep = $this->proposalSelectionVoteRepository->findBy(['user' => $user, 'selectionStep' => $step]);

            if (!$currentUser && $userAlreadyVotedInThisStep) {
                $this->context->buildViolation($constraint->alreadyUsedMessage)->addViolation();

                return;
            }

            if ($currentUser && $anonUserAlreadyVotedInThisStep) {
                $this->context->buildViolation($constraint->alreadyUsedMessage)->addViolation();

                return;
            }

            return;
        }

        // when current user is unauthenticated only check if there is an existing user with this number
        if (!$currentUser && $user) {
            $this->context->buildViolation($constraint->alreadyUsedMessage)->addViolation();
        }

        if (($user && $currentUser) && $user !== $currentUser) {
            $this->context->buildViolation($constraint->alreadyUsedMessage)->addViolation();
        }
    }
}
