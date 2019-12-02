<?php
namespace Capco\AppBundle\Form;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SearchType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $choices = $this->generateChoices();

        $builder
            ->add('term', TextType::class, [
                'required' => false,
                'label' => 'search.form.label.term',
                'translation_domain' => 'CapcoAppBundle',
                'attr' => ['placeholder' => 'search.form.placeholder.term'],
            ])
            ->add('type', ChoiceType::class, [
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
                'placeholder' => false,
                'expanded' => true,
                'choices' => $choices,
            ])
            ->add('sort', ChoiceType::class, [
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
                'placeholder' => false,
                'choices' => [
                    'search.form.sort.score' => 'score',
                    'global.date.text' => 'date',
                ],
                'attr' => ['onchange' => 'this.form.submit()'],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }

    private function generateChoices()
    {
        $choices = [
            'global.all' => 'all',
            'search.form.types.proposals' => 'proposal',
            'global.comments.label' => 'comment',
            'global.arguments.label' => 'argument',
            'global.participative.project' => 'project',
            'search.form.types.opinions' => 'opinion',
            'global.sources.label' => 'source',
        ];

        if ($this->toggleManager->isActive('versions')) {
            $choices['global.amendements.label'] = 'opinionVersion';
        }
        if ($this->toggleManager->isActive('blog')) {
            $choices['global.articles'] = 'post';
        }
        if ($this->toggleManager->isActive('calendar')) {
            $choices['global.events'] = 'event';
        }
        if ($this->toggleManager->isActive('themes')) {
            $choices['global.themes'] = 'theme';
        }

        $choices['search.form.types.users'] = 'user';

        return $choices;
    }
}
