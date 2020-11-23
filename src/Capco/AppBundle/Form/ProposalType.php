<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\EventListener\PreFillProposalFormSubscriber;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\AutoCompleteDocQueryResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\AutoCompleteFromSiretQueryResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Capco\AppBundle\Toggle\Manager;
use Infinite\FormBundle\Form\Type\PolyCollectionType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;

class ProposalType extends AbstractType
{
    protected Manager $toggleManager;
    private $cache;
    private $autoCompleteDocQueryResolver;
    private $autoCompleteFromSiretQueryResolver;

    public function __construct(
        RedisCache $cache,
        AutoCompleteDocQueryResolver $autoCompleteDocQueryResolver,
        AutoCompleteFromSiretQueryResolver $autoCompleteFromSiretQueryResolver,
        Manager $toggleManager
    ) {
        $this->toggleManager = $toggleManager;
        $this->cache = $cache;
        $this->autoCompleteDocQueryResolver = $autoCompleteDocQueryResolver;
        $this->autoCompleteFromSiretQueryResolver = $autoCompleteFromSiretQueryResolver;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $isDraft = $builder->getData()->isDraft();
        $form = $options['proposalForm'];
        if (!$form) {
            throw new \Exception('A proposal form is needed to create or update a proposal.');
        }

        $builder
            ->add('title', TextType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('summary', TextareaType::class, [
                'required' => false,
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('body', TextareaType::class, [
                'required' => $isDraft,
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ]);

        if ($this->toggleManager->isActive(Manager::themes) && $form->isUsingThemes()) {
            $builder->add('theme');
        }

        if ($form->isUsingCategories()) {
            $builder->add('category');
        }

        if (
            $this->toggleManager->isActive(Manager::unstable__tipsmeee) &&
            $form->isUsingTipsmeee()
        ) {
            $builder->add('tipsmeeeId');
        }

        if ($this->toggleManager->isActive(Manager::districts) && $form->isUsingDistrict()) {
            $builder->add('district');
        }

        if ($form->getUsingAddress()) {
            $builder->add('address', TextType::class);
        }

        $builder->add('responses', PolyCollectionType::class, [
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
            'index_property' => 'position',
            'types' => [ValueResponseType::class, MediaResponseType::class],
            'type_name' => AbstractResponse::TYPE_FIELD_NAME,
        ]);

        $builder->add('media');

        $builder->addEventSubscriber(
            new PreFillProposalFormSubscriber(
                $this->cache,
                $this->autoCompleteDocQueryResolver,
                $this->autoCompleteFromSiretQueryResolver
            )
        );
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Proposal::class,
            'csrf_protection' => false,
            'translation_domain' => false,
            'constraints' => new Valid(),
            'proposalForm' => null,
        ]);
    }
}
