<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\District\AbstractDistrict;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Capco\AppBundle\Toggle\Manager;
use Infinite\FormBundle\Form\Type\PolyCollectionType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;

/**
 * @extends AbstractType<Proposal>
 */
class ProposalType extends AbstractType
{
    public function __construct(protected Manager $toggleManager)
    {
    }

    /**
     * @param FormBuilderInterface<Proposal> $builder
     * @param array<string, mixed>           $options
     *
     * @throws \Exception
     */
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $isDraft = $builder->getData()->isDraft();
        /** @var ?ProposalForm $form */
        $form = $options['proposalForm'];
        if (!$form) {
            throw new \Exception('A proposal form is needed to create or update a proposal.');
        }

        $builder
            ->add('title', TextType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('summary', TextareaType::class, [
                'required' => false,
                'purify_html' => true,
                'purify_html_profile' => 'user',
            ])
            ->add('body', TextareaType::class, [
                'required' => $isDraft,
                'purify_html' => true,
                'purify_html_profile' => 'user',
            ])
            ->add('bodyUsingJoditWysiwyg')
        ;

        if ($this->toggleManager->isActive(Manager::themes) && $form->isUsingThemes()) {
            $builder->add('theme');
        }

        if ($form->isUsingCategories()) {
            $builder->add('category');
        }

        if ($this->toggleManager->isActive(Manager::districts) && $form->isUsingDistrict()) {
            $builder->add('district', RelayNodeType::class, [
                'class' => AbstractDistrict::class,
            ]);
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
    }

    public function configureOptions(OptionsResolver $resolver): void
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
