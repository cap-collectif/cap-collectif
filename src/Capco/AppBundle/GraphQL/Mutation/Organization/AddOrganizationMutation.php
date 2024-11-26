<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Form\OrganizationType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Locale\LocaleUtils;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\DBAL\Exception\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

class AddOrganizationMutation implements MutationInterface
{
    use MutationTrait;
    private readonly EntityManagerInterface $em;
    private readonly FormFactoryInterface $formFactory;
    private readonly SluggerInterface $slugger;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        SluggerInterface $slugger
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->slugger = $slugger;
    }

    public function __invoke(Arg $input): array
    {
        $this->formatInput($input);
        $data = $input->getArrayCopy();
        LocaleUtils::indexTranslations($data);

        $organization = new Organization();
        $organization->mergeNewTranslations();

        if (isset($data['translations'])) {
            $this->updateSlug($organization, $data['translations']);
        }

        $form = $this->formFactory->create(OrganizationType::class, $organization);
        $form->submit($data, false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->persist($organization);
            $this->em->flush();
        } catch (DriverException $e) {
            throw new UserError($e->getMessage());
        }

        return ['organization' => $organization];
    }

    private function updateSlug(Organization $organization, array $translations): void
    {
        foreach ($translations as $translation) {
            if ($translation['title']) {
                $slug = strtolower($this->slugger->slug($translation['title'])->toString());
                $organization->setSlug($slug);

                return;
            }
        }
    }
}
