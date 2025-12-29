---
name: form-mutation
description: Crée un formulaire React Hook Form connecté à une mutation Relay avec validation yup et gestion d'erreurs. Utiliser pour formulaires avec soumission GraphQL.
---

# Form + Relay Mutation

Crée un formulaire React Hook Form connecté à une mutation Relay avec les patterns du projet.

## Structure de base

```typescript
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useIntl } from 'react-intl'
import { Button, Flex } from '@cap-collectif/ui'
import { FormControl, FieldInput } from '@cap-collectif/form'
import { mutationErrorToast } from '@utils/mutation-error-toast'
import UpdateEntityMutation from '@mutations/UpdateEntityMutation'

// 1. Form types
type FormValues = {
  title: string
  description: string | null
  isActive: boolean
}

// 2. Yup validation schema
const getSchema = (intl: IntlShape) =>
  yup.object().shape({
    title: yup
      .string()
      .required(intl.formatMessage({ id: 'global.required' }))
      .min(2, intl.formatMessage({ id: 'global.min-length' }, { count: 2 })),
    description: yup.string().nullable(),
    isActive: yup.boolean(),
  })

// 3. Initial values from Relay data
const getInitialValues = (data: EntityFragment$data): FormValues => ({
  title: data.title,
  description: data.description ?? null,
  isActive: data.isActive,
})

// 4. Form component
export const EntityForm: React.FC<Props> = ({ entity }) => {
  const intl = useIntl()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: getInitialValues(entity),
    resolver: yupResolver(getSchema(intl)),
  })

  const { handleSubmit, formState: { isValid } } = methods

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true)

    const input = {
      entityId: entity.id,
      title: values.title,
      description: values.description,
      isActive: values.isActive,
    }

    UpdateEntityMutation.commit({ input })
      .then(() => {
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'global.changes.saved' }),
        })
      })
      .catch(() => {
        mutationErrorToast(intl)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl name="title" control={methods.control} isRequired>
          <FormControl.Label>
            {intl.formatMessage({ id: 'global.title' })}
          </FormControl.Label>
          <FieldInput
            name="title"
            control={methods.control}
            type="text"
          />
        </FormControl>

        <FormControl name="description" control={methods.control}>
          <FormControl.Label>
            {intl.formatMessage({ id: 'global.description' })}
          </FormControl.Label>
          <FieldInput
            name="description"
            control={methods.control}
            type="textarea"
          />
        </FormControl>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={!isValid || isSubmitting}
        >
          {intl.formatMessage({ id: 'global.save' })}
        </Button>
      </form>
    </FormProvider>
  )
}
```

## Validation conditionnelle

```typescript
const schema = yup.object().shape({
  isExternal: yup.boolean(),
  externalLink: yup.string().when('isExternal', {
    is: true,
    then: yup
      .string()
      .required(intl.formatMessage({ id: 'global.required' }))
      .url(intl.formatMessage({ id: 'global.invalid-url' })),
    otherwise: yup.string().nullable(),
  }),
})
```

## Pattern Hook Mutation (frontend/js)

Pour `frontend/js/`, utiliser le pattern hook :

```typescript
// mutations/UpdateEntityMutation.ts
import { graphql, useMutation } from 'react-relay'
import type { UpdateEntityMutation as MutationType } from '@relay/UpdateEntityMutation.graphql'

const mutation = graphql`
  mutation UpdateEntityMutation($input: UpdateEntityInput!) {
    updateEntity(input: $input) {
      entity {
        id
        title
      }
      errorCode
    }
  }
`

export const useUpdateEntityMutation = () => {
  const [commit, isLoading] = useMutation<MutationType>(mutation)
  return { commit, isLoading }
}

// In component
const { commit, isLoading } = useUpdateEntityMutation()

const onSubmit = (values: FormValues) => {
  commit({
    variables: { input: { ...values, entityId: entity.id } },
    onCompleted: (response, errors) => {
      if (errors?.length || response.updateEntity?.errorCode) {
        mutationErrorToast(intl)
        return
      }
      successToast()
    },
    onError: () => mutationErrorToast(intl),
  })
}
```

## Pattern Promise Mutation (admin-next)

Pour `admin-next/`, utiliser le pattern promise :

```typescript
// mutations/UpdateEntityMutation.ts
import { graphql } from 'react-relay'
import { commitMutation } from './commitMutation'
import type { UpdateEntityMutation } from '@relay/UpdateEntityMutation.graphql'

const mutation = graphql`
  mutation UpdateEntityMutation($input: UpdateEntityInput!) {
    updateEntity(input: $input) {
      entity { id title }
      errorCode
    }
  }
`

const commit = (variables: UpdateEntityMutation['variables']) =>
  commitMutation<UpdateEntityMutation>({
    mutation,
    variables,
  })

export default { commit }

// In component
UpdateEntityMutation.commit({ input })
  .then(response => { ... })
  .catch(error => { ... })
```

## Gestion d'erreurs manuelle

```typescript
const { setError } = useFormContext()

const onSubmit = (values: FormValues) => {
  if (!values.address) {
    setError('address', {
      type: 'manual',
      message: intl.formatMessage({ id: 'address.required' }),
    })
    return
  }
  // ... mutation
}
```

## Auto-save avec debounce

```typescript
import { useDebounce } from 'use-debounce'

const { watch } = methods
const watchedValues = watch()
const [debouncedValues] = useDebounce(watchedValues, 500)

React.useEffect(() => {
  if (methods.formState.isDirty && methods.formState.isValid) {
    onSubmit(debouncedValues)
  }
}, [debouncedValues])
```

## Types de champs FieldInput

```typescript
<FieldInput type="text" />
<FieldInput type="textarea" />
<FieldInput type="number" />
<FieldInput type="email" />
<FieldInput type="password" />
<FieldInput type="select" options={[{ value: 'a', label: 'A' }]} />
<FieldInput type="checkbox" />
<FieldInput type="radio" choices={[...]} />
<FieldInput type="date" />
<FieldInput type="uploader" />  {/* File upload */}
```

## Exemples du projet

- Validation yup : [ProjectConfigForm.tsx](admin-next/components/BackOffice/Projects/ProjectConfig/ProjectConfigForm.tsx)
- Hook mutation : [AddressRequirementModal.tsx](frontend/js/components/ParticipationWorkflow/AddressRequirementModal.tsx)
- Promise mutation : [OrganizationConfigForm.tsx](admin-next/components/BackOffice/Organizations/OrganizationConfigForm.tsx)

## Checklist

- [ ] Types `FormValues` définis
- [ ] Schéma yup avec messages i18n
- [ ] `defaultValues` depuis les données Relay
- [ ] `FormProvider` enveloppe le form
- [ ] Gestion `isSubmitting` / `isLoading`
- [ ] Toast succès et erreur
- [ ] Bouton submit disabled si invalide
