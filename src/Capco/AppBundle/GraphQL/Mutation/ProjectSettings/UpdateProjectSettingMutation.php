<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectSettings;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Mutation\UpdateSiteParameterMutation;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateProjectSettingMutation implements MutationInterface
{
    use MutationTrait;

    final public const PROJECT_PARAMETER_NOT_FOUND = 'PROJECT_PARAMETER_NOT_FOUND';
    final public const INVALID_VALUE = 'INVALID_VALUE';

    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UpdateSiteParameterMutation $updateSiteParameterMutation,
        private readonly ValidatorInterface $validator
    ) {
    }

    /**
     * @return array{siteParameter?: SiteParameter, errorCode?: string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $locale = $input->offsetGet('locale');

        try {
            $siteParameter = $this->repository->find($input->offsetGet('id'));
            if (!$siteParameter instanceof SiteParameter || 'pages.projects' !== $siteParameter->getCategory()) {
                throw new UserError(self::PROJECT_PARAMETER_NOT_FOUND);
            }

            $value = (string) $input->offsetGet('value');
            if (SiteParameter::TYPE_INTEGER === (int) $siteParameter->getType() && (!ctype_digit($value) || (int) $value <= 0)) {
                throw new UserError(self::INVALID_VALUE);
            }

            // The entity may already be managed with a translation collection that was initialized
            // for only one locale. Complete it before updating so setValue() finds an existing
            // translation and the validator reads the value that is actually being edited.
            $this->loadTranslations($siteParameter);
            $siteParameter->setValue($value, $locale);
            $siteParameter->setCurrentLocale($locale);
            $siteParameter->setIsEnabled((bool) $input->offsetGet('isEnabled'));
            $siteParameter->mergeNewTranslations();
            if (0 !== $this->validator->validate($siteParameter)->count()) {
                throw new UserError(self::INVALID_VALUE);
            }
            $this->entityManager->flush();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        $this->updateSiteParameterMutation->invalidateCache($siteParameter, $locale);

        return ['siteParameter' => $siteParameter];
    }

    private function loadTranslations(SiteParameter $siteParameter): void
    {
        if (!$siteParameter->isTranslatable()) {
            return;
        }

        $translations = $this->entityManager
            ->getRepository(SiteParameterTranslation::class)
            ->findBy(['translatable' => $siteParameter])
        ;

        foreach ($translations as $translation) {
            $siteParameter->addTranslation($translation);
        }
    }
}
