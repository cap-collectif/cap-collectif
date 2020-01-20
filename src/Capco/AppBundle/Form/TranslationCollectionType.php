<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\EventListener\TranslationCollectionTypeSubscriber;
use Capco\AppBundle\Repository\LocaleRepository;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class TranslationCollectionType extends AbstractType
{
    private $subscriber;
    private $availableLocales;
    private $publishedLocales;
    private $defaultLocale;

    public function __construct(TranslationCollectionTypeSubscriber $subscriber, LocaleRepository $localeRepository)
    {
        $this->subscriber = $subscriber;
        foreach($localeRepository->findEnabledLocales() as $locale) {
            $this->availableLocales[] = $locale->getCode();
            if ($locale->isPublished()) {
                $this->publishedLocales[] = $locale->getCode();
                if ($locale->isDefault()) {
                    $this->defaultLocale = $locale->getCode();
                }
            }
        }
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder->addEventSubscriber($this->subscriber);
    }

    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $view->vars['default_locale'] = $options['default_locale'];
        $view->vars['required_locales'] = $options['required_locales'];
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'by_reference' => false,
            'locales' => $this->availableLocales,
            'default_locale' => $this->defaultLocale,
            'required_locales' => $this->publishedLocales,
            'fields' => [],
            'excluded_fields' => [],
            'allow_extra_fields' => true
        ]);
    }

    public function getBlockPrefix()
    {
        return '';
    }
}
